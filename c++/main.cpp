#include <algorithm>
#include <iostream>
#include <fstream>
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
int color_step = 15;
vector<vector<vector<bool>>> processed_colors(256, vector<vector<bool>>(256, vector<bool>(256)));
const uint8_t numConsumers = 16;
const uint16_t color_sending_limit = 100;

SyncQueue<Mat> frameQueue;
SyncQueue<Measurement> measurementQueue;
SyncQueue<Measurement> debugQueue;


string client_url = "http://localhost:3001";

nlohmann::json generate_colors_array() {
    // Create the JSON object
    int step = color_step;
    nlohmann::json j;

    // Generate the color tuples and add them to the JSON object
    nlohmann::json colorsArray = nlohmann::json::array();
    for (int red = 0; red <= 255; red += step) {
        for (int green = 0; green <= 255; green += step) {
            for (int blue = 0; blue <= 255; blue += step) {
                if (colorsArray.size() >= color_sending_limit){
                    j["colors"] = colorsArray;
                    return j;
                }
                if (!processed_colors[red][green][blue]) {
                    colorsArray.push_back({red, green, blue});
                }
            }
        }
    }
    j["colors"] = colorsArray;

    return j; // Return the entire JSON object
}

void producer() {
    Mat frame;
    VideoCapture stream(0, CAP_DSHOW);
    //stream.set(CAP_PROP_SETTINGS, 1);

    frame_height = (uint)stream.get(CAP_PROP_FRAME_HEIGHT);
    frame_width = (uint)stream.get(CAP_PROP_FRAME_WIDTH);

    if (!stream.isOpened()) {
        cout << "webcam in use";
    }

    Measurement::set_gray_correction_layer(stream);

    //tell calibration server to listen for /addColors
    httplib::Client cli(client_url);

    //addColors    
    // gotta send in chunks
    nlohmann::json j;
    j["number"] = 200; // the delay between colors showing
    j["colors"] = generate_colors_array();
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

    while (!frameQueue.stopped()) {
        stream.read(frame);
        imshow("Webcam Ouptut", frame);
        frameQueue.push(frame.clone());
        waitKey(1);
    }
}

void consumer(int id) {
    ZXing::DecodeHints hints=DecodeHints().setFormats(BarcodeFormat::QRCode).setTryRotate(true).setMaxNumberOfSymbols(10);;
    while (true) {
        pair<bool, Mat> result = frameQueue.pop();
        if (!result.first) {
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
            
            if (qr_code_data == "gray") {
                continue;
            } else if (qr_code_data == "end") {
                frameQueue.stop();
                break;
            }
            Position points = qrcode.position();
            
            vector<Point> quadPoints;
            quadPoints.push_back(Point(points.bottomLeft().x, points.bottomLeft().y));
            quadPoints.push_back(Point(points.topLeft().x,points.topLeft().y));
            quadPoints.push_back(Point(points.topRight().x, points.topRight().y));
            quadPoints.push_back(Point(points.bottomRight().x,points.bottomRight().y));

            // get singular color measurement
            // Scalar average_color = get_average_color(frame, quadPoints);
            // // debugQueue.push(get_average_color_matrix(frame,quadPoints).clone());
            // // parse qr_code data
            // string measurement = qr_code_data;
            // for (int i = 0; i < 3; ++i) {
            //     measurement += ',';
            //     measurement += to_string(average_color[i]);
            // }
            Measurement measurement(frame,quadPoints,qr_code_data);
            std::cout << "Decoded QR Code: " << qr_code_data << "Measured Color:"<< measurement.get_csv_measurement() << endl;
            Scalar measurement_stddev = measurement.get_standard_deviation();
            Scalar stddev_limits = Measurement::get_acceptable_stddev();
            if (measurement_stddev[0]<stddev_limits[0]&&measurement_stddev[1]<stddev_limits[1]&&measurement_stddev[2]<stddev_limits[2]){
                measurementQueue.push(measurement);
            }else{
                cout<<"thrown out frame"<<endl;
                debugQueue.push(measurement);
            }
        } else {
            //cout << "Consumer " << id << ": No QR" << endl;
        }
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
    VideoCapture stream(0, CAP_DSHOW);
    stream.set(CAP_PROP_SETTINGS, 1);
    
    //Prepare CSV
    ofstream measurement_csv("measurements.csv");
    measurement_csv << "\"Displayed Color Code\",\"Measured Color Code\"\n"; // the column headers

    while(!generate_colors_array()["colors"].empty()){
        thread producerThread(producer);
        thread consumers[numConsumers];

        for (uint8_t i = 0; i < numConsumers; ++i) {
            consumers[i] = thread(consumer, i);
        }

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
            imwrite("measurements/measurement"+to_string(i)+".png", measurement.get_processed_frame());
            i++;
        }
        i=0;
        while(!debugQueue.empty()){
            pair<bool, Measurement> result = debugQueue.pop();
            
            Measurement measurement=result.second;
            
            imwrite("measurements/debug"+to_string(i)+".png", measurement.get_processed_frame());
            i++;
        }
        // Reset the queues
        frameQueue.reset();
        measurementQueue.reset();
        debugQueue.reset();
    }

    measurement_csv.close();

    return 0;
}
