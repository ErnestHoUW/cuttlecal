#include <iostream>
#include <opencv2/opencv.hpp>
#include <chrono>

using namespace std::chrono;
using namespace cv;
using namespace std;

int main() {
    Mat frame;
    namedWindow("Webcam_Output");

    VideoCapture cap(0,CAP_DSHOW);

    if (!cap.isOpened()) {
        cout << "webcam in use";
    }

    double amount_of_frames = 1000;
    int64 sum_latency = 0;
    for (size_t i = 0; i < amount_of_frames; i++) {
        auto start = high_resolution_clock::now();
        cap.read(frame);

        imshow("Webcam_Output", frame);
        
        auto stop = high_resolution_clock::now();
        int64 latency = duration_cast<microseconds>(stop - start).count();
        sum_latency += latency;
        waitKey(1);
    }

    cout << "Average Latency: " << sum_latency / amount_of_frames / 1000 << " msec" <<endl;

    return 0;
}

