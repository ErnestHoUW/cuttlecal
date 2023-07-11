#include <algorithm>
#include <iostream>
#include <opencv2/opencv.hpp>

#include <BarcodeFormat.h>
#include <DecodeHints.h>
#include <TextUtfEncoding.h>
#include <ReadBarcode.h>

#include "image_processing.h"
#include "syncqueue.h"

using namespace cv;
using namespace ZXing;
using namespace std;

int frame_height;
int frame_width;
Mat gray_correction_layer;

SyncQueue<Mat> frameQueue;
SyncQueue<Mat> debugQueue;
SyncQueue<string> measurementQueue;

void producer() {
    Mat frame;
    VideoCapture stream(0, CAP_DSHOW);
    stream.set(CAP_PROP_SETTINGS, 1);

    frame_height = (uint)stream.get(CAP_PROP_FRAME_HEIGHT);
    frame_width = (uint)stream.get(CAP_PROP_FRAME_WIDTH);

    if (!stream.isOpened()) {
        cout << "webcam in use";
    }

    // gray_correction_layer = get_gray_correction_layer(stream);

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
        // cout << "Consumer " << id << ": pooped" << endl;
        // string windowname = "Consumer " + to_string(id) + " Frame";
        // imshow(windowname, frame);
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
            
            vector<cv::Point> quadPoints;
            quadPoints.push_back(Point(points.bottomLeft().x, points.bottomLeft().y));
            quadPoints.push_back(Point(points.topLeft().x,points.topLeft().y));
            quadPoints.push_back(Point(points.topRight().x, points.topRight().y));
            quadPoints.push_back(Point(points.bottomRight().x,points.bottomRight().y));

            // get singular color measurement
            Scalar average_color = get_average_color(frame, quadPoints);
            debugQueue.push(get_color_average_matrix(frame,quadPoints).clone());
            // parse qr_code data
            string measurement = qr_code_data;
            for (int i = 0; i < 3; ++i) {
                measurement += ',';
                measurement += to_string(average_color[i]);
            }
            std::cout << "Decoded QR Code: " << qr_code_data << "Measured Color:"<< measurement << endl;
            frame.release();
            measurementQueue.push(measurement);
        } else {
            //cout << "Consumer " << id << ": No QR" << endl;
        }
    }
}

int main() {
    thread producerThread(producer);

    const uint8_t numConsumers = 16;
    thread consumers[numConsumers];

    for (uint8_t i = 0; i < numConsumers; ++i) {
        consumers[i] = thread(consumer, i);
    }

    producerThread.join();

    for (auto& c : consumers) {
        c.join();
    }

    destroyAllWindows();
    
    int i=0;
    while(true){
        pair<bool, Mat> result = debugQueue.pop();
        if (!result.first) {
            break;  // No more values to consume
        }
        Mat debug_frame=result.second;
        imwrite("Debug"+to_string(i)+".png",debug_frame);
        i++;
    }

    return 0;
}
