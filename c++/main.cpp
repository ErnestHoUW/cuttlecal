#include <algorithm>
#include <iostream>
#include <fstream>
#include <opencv2/opencv.hpp>
#include <curl/curl.h>

#include <BarcodeFormat.h>
#include <DecodeHints.h>
#include <TextUtfEncoding.h>
#include <ReadBarcode.h>

#include "syncqueue.h"
#include "measurement.h"

using namespace cv;
using namespace ZXing;
using namespace std;

int frame_height;
int frame_width;;

SyncQueue<Mat> frameQueue;
SyncQueue<Measurement> measurementQueue;
SyncQueue<Measurement> debugQueue;

void producer() {
    Mat frame;
    VideoCapture stream(0, CAP_DSHOW);
    stream.set(CAP_PROP_SETTINGS, 1);

    frame_height = (uint)stream.get(CAP_PROP_FRAME_HEIGHT);
    frame_width = (uint)stream.get(CAP_PROP_FRAME_WIDTH);

    if (!stream.isOpened()) {
        cout << "webcam in use";
    }

    Measurement::set_gray_correction_layer(stream);

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

int main() {
    cout<<"hello"<<endl;
    thread producerThread(producer);
    cout<<"hello"<<endl;
    const uint8_t numConsumers = 16;
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
    ofstream measurement_csv("measurements.csv");

    measurement_csv << "\"Displayed Color Code\",\"Measured Color Code\"\n"; // the column headers
    
    int i=0;
    while(true){
        pair<bool, Measurement> result = measurementQueue.pop();
        if (!result.first) {
            break;  // No more values to consume
        }
        
        Measurement measurement=result.second;
        Scalar color_code = measurement.get_displayed_color_code();
        measurement_csv << measurement.get_csv_measurement() <<"\n";
        imwrite("measurement"+to_string(i)+".png", measurement.get_processed_frame());
        i++;
    }
    i=0;
    while(true){
        pair<bool, Measurement> result = debugQueue.pop();
        if (!result.first) {
            break;  // No more values to consume
        }
        
        Measurement measurement=result.second;
        
        imwrite("Debug"+to_string(i)+".png", measurement.get_processed_frame());
        i++;
    }
    measurement_csv.close();

    return 0;
}
