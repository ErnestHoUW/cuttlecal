#include <algorithm>
#include <iostream>
#include <fstream>
#include <future>
#include <httplib.h>
#include <random>
#include <nlohmann/json.hpp>
#include <opencv2/opencv.hpp>
#include <vector>

#include <ZXing/ReadBarcode.h>
#include <ZXing/BarcodeFormat.h>
#include <ZXing/DecodeHints.h>
#include <ZXing/TextUtfEncoding.h>

#include "syncqueue.h"
#include "measurement.h"

using namespace cv;
using namespace ZXing;
using namespace std;

int frame_height;
int frame_width;
int frame_length = 50;
int color_step = 50;
vector<vector<vector<bool>>> processed_colors(256, vector<vector<bool>>(256, vector<bool>(256)));
const uint8_t numConsumers = 16;

SyncQueue<Mat> frameQueue;
SyncQueue<Measurement> measurementQueue;
SyncQueue<Measurement> debugQueue;


string client_url = "http://localhost:3001";

nlohmann::json generate_colors_array() {
    // Create the JSON object
    int step = color_step;

    // Generate the color tuples and add them to the JSON object
    nlohmann::json colorsArray = nlohmann::json::array();
    for (int red = 0; red <= 255; red += step) {
        for (int green = 0; green <= 255; green += step) {
            for (int blue = 0; blue <= 255; blue += step) {
                // if (colorsArray.size() >= color_sending_limit){
                //     return colorsArray;
                // }
                if (!processed_colors[red][green][blue]) {
                    colorsArray.push_back({red, green, blue});
                }
            }
        }
    }

    return colorsArray; // Return the entire JSON object
}

void producer(std::promise<void>& readyPromise) {
    cout << "hello";
    Mat frame;
    VideoCapture stream(0, CAP_DSHOW);
    //stream.set(CAP_PROP_SETTINGS, 1);

    frame_height = (uint)stream.get(CAP_PROP_FRAME_HEIGHT);
    frame_width = (uint)stream.get(CAP_PROP_FRAME_WIDTH);

    while (!stream.isOpened()) {
        cout << "Waiting for the webcam..." << endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        stream.open(0, CAP_DSHOW);
    }
    if (!Measurement::isGrayCorrectionLayerSet()) {
        Measurement::set_gray_correction_layer(stream);
    }
    
    bool firstFrameRead = false;
    while (!frameQueue.stopped()) {
        stream.read(frame);
        imshow("Webcam Output", frame);
        frameQueue.push(frame.clone());
        if (frame.empty()) {
            continue; // Skip if the frame is empty
        }

        if (!firstFrameRead) {
            readyPromise.set_value(); // Signal that the first frame has been read
            firstFrameRead = true;
        }
        
        waitKey(1);
    }
}

void consumer(int id) {
    ZXing::DecodeHints hints=DecodeHints().setFormats(BarcodeFormat::QRCode).setTryRotate(true).setMaxNumberOfSymbols(10);;
    while (true) {
        pair<bool, Mat> result = frameQueue.pop();
        if (frameQueue.stopped() || !result.first) {
            break;  // No more values to consume
        }
        
        Mat frame = result.second;
        ZXing::ImageView imageView(frame.data, frame.cols, frame.rows, ZXing::ImageFormat::BGR);
        // fix gray uniformity
        // frame = correct_gray_uniformity(frame, gray_correction_layer);
        //auto start = std::chrono::high_resolution_clock::now();
        ZXing::Result qrcode = ReadBarcode(imageView, hints);
        //auto end = std::chrono::high_resolution_clock::now();
        //int64 duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
        //cout << "Consumer " << id << ": Working on color (" << duration << " ms)";
        
        if (qrcode.isValid()) {
            string qr_code_data=qrcode.text();

            cout<< qr_code_data<<endl;
            
            if (qr_code_data == "gray" || qr_code_data == "end") {
                continue;
            }
            // }else if (qr_code_data == "end") {
            //     frameQueue.stop();
            //     break;
            // }
            Position points = qrcode.position();
            
            vector<Point> quadPoints;
            quadPoints.push_back(Point(points.bottomLeft().x, points.bottomLeft().y));
            quadPoints.push_back(Point(points.topLeft().x,points.topLeft().y));
            quadPoints.push_back(Point(points.topRight().x, points.topRight().y));
            quadPoints.push_back(Point(points.bottomRight().x,points.bottomRight().y));

            Measurement measurement(frame,quadPoints,qr_code_data);
            std::cout << "Decoded QR Code: " << qr_code_data << "Measured Color:"<< measurement.get_csv_measurement() << endl;
            Scalar measurement_stddev = measurement.get_standard_deviation();
            Scalar stddev_limits = Measurement::get_acceptable_stddev();
            if (measurement_stddev[0]<stddev_limits[0]&&measurement_stddev[1]<stddev_limits[1]&&measurement_stddev[2]<stddev_limits[2]){
                measurementQueue.push(measurement);
            }else{
                cout<<"thrown out frame"<<endl;
                // debugQueue.push(measurement);
            }
        } else {
            cout << "Consumer " << id << ": No QR" << endl;
            Measurement measurement(frame);
            debugQueue.push(measurement);
        }
    }
}
void checkDisplayStatus() {
    httplib::Client cli(client_url);
    bool ran = false;
    while (true) { // Infinite loop to keep checking the status
        auto res = cli.Get("/colorDisplayStatus");
        if (res && res->status == 200) {
            try {
                // Parse the response body into a JSON object
                auto responseJson = nlohmann::json::parse(res->body);
                cout << responseJson.dump();
                
                // Access the "color_display_status" field
                bool displayStatus = responseJson["color_display_status"].get<bool>();

                if (ran && !displayStatus) {
                    frameQueue.stop(); // Stop the frame queue
                    break; // Exit the loop and end the thread after stopping the queue
                } else {
                    ran = true;
                }
            } catch (nlohmann::json::parse_error& e) {
                cerr << "JSON parsing error: " << e.what() << endl;
            } catch (nlohmann::json::type_error& e) {
                cerr << "JSON type error: " << e.what() << endl;
            }
        } else {
            cerr << "Failed to get color display status or server error occurred." << endl;
        }
        this_thread::sleep_for(chrono::milliseconds(500)); // Wait for 500ms before the next check
    }
}

int main(int argc, char* argv[]) {

    // Finding color step from command line arguements
    for (int i = 1; i < argc; ++i) { // Start from 1 to skip the program name
        std::string arg = argv[i];
        if ((arg == "-c" || arg == "--color-step") && i + 1 < argc) { // Check for the flag and ensure there's an argument after it
            color_step = std::atoi(argv[++i]); // Convert next argument to integer and increment i
        } else {
            std::cerr << "Unknown option: " << arg << std::endl;
            return 1; // Return an error code
        }
    }
    // Camera Settings
    cout << "hello1" << endl;
    VideoCapture stream(0, CAP_DSHOW);
    stream.set(CAP_PROP_SETTINGS, 1);

    
    
    //Prepare CSV
    ofstream measurement_csv("measurements.csv");
    measurement_csv << "\"Displayed Color Code\",\"Measured Color Code\"\n"; // the column headers

    for (int k = 0; k<2; k++){
        promise<void> frameReadyPromise;
        future<void> frameReadyFuture = frameReadyPromise.get_future();

        std::cout << "Starting producer thread..." << std::endl;
        thread producerThread(producer, std::ref(frameReadyPromise));
        std::cout << "Producer thread started." << std::endl;

        thread consumers[numConsumers];
        
        for (uint8_t i = 0; i < numConsumers; ++i) {
            consumers[i] = thread(consumer, i);
        }

        frameReadyFuture.wait(); // Wait for the first frame to be read by the producer
        std::this_thread::sleep_for(std::chrono::seconds(1));
        //tell calibration server to listen for /addColors
        httplib::Client cli(client_url);

        nlohmann::json j;
        j["frame_length"] = frame_length; // the delay between colors showing
        j["colors"] = generate_colors_array();
        std::cout << j.dump() << endl;
        auto res = cli.Post("/addColors", j.dump(), "application/json");

        if (res) {
            if (res->status == 200) {
                cout << res->body << endl;
            } else {
                cout << "Failed to post JSON, status code: " << res->status << endl;
            }
        } else {
            cout << "Failed to connect to the server or other network error occurred." << endl;
        }

        thread clientStatusCheck(checkDisplayStatus);
        clientStatusCheck.join();
        producerThread.join();

        for (auto& c : consumers) {
            c.join();
        }

        measurementQueue.stop();
        debugQueue.stop();

        destroyAllWindows();

        cout<< "hihi done" <<endl;
        //export measurments to csv
        int i=0;
        while(!measurementQueue.empty()){
            pair<bool, Measurement> result = measurementQueue.pop();
            
            Measurement measurement=result.second;
            Scalar color_code = measurement.get_displayed_color_code();
            // Mark that this color has been successfully captured
            processed_colors[(int)color_code[0]][(int)color_code[1]][(int)color_code[2]] = true;
            measurement_csv << measurement.get_csv_measurement() <<"\n";
            //imwrite("measurements/measurement"+to_string(i)+".png", measurement.get_processed_frame());
            i++;
        }
        i=0;
        while(!debugQueue.empty()){
            pair<bool, Measurement> result = debugQueue.pop();
            
            Measurement measurement=result.second;
            
            //imwrite("measurements/debug"+to_string(i)+".png", measurement.get_processed_frame());
            i++;
        }
        // Reset the queues
        frameQueue.reset();
        measurementQueue.reset();
        debugQueue.reset();
        frame_length +=50;
    }

    measurement_csv.close();
    // Tell frontend the calibration is over
    httplib::Client cli(client_url);
    auto res = cli.Get("/endCalibration");

    if (res) {
        if (res->status == 200) {
            cout << res->body << endl;
        } else {
            cout << "Failed to post JSON, status code: " << res->status << endl;
        }
    } else {
        cout << "Failed to connect to the server or other network error occurred." << endl;
    }
    return 0;
}
