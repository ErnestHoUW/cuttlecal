#include <iostream>
#include <opencv2/opencv.hpp>
#include <chrono>

using namespace std::chrono;
using namespace cv;
using namespace std;

int main() {
    Mat frame;
    namedWindow("Webcam Output");

    VideoCapture cap(0);

    if (!cap.isOpened()) {
        cout << "webcam in use";
    }

    time_t start, end;
    int amount_of_frames = 1000;
    double sum_latency = 0;
    for (size_t i = 0; i < 1000; i++) {
        auto start = high_resolution_clock::now();
        cap >> frame;

        imshow("Webcam Output", frame);
        waitKey(1);
        auto stop = high_resolution_clock::now();
        sum_latency += duration_cast<milliseconds>(stop - start).count;
    }

    cout << "Average Latency: " << sum_latency / amount_of_frames << setprecision(5) << " msec" <<endl;

    return 0;
}
