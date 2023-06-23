#include <iostream>
#include <opencv2/opencv.hpp>

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
        time(&start);
        cap >> frame;

        imshow("Webcam Output", frame);
        waitKey(1);
        time(&end);
        sum_latency += double(end - start);
    }

    cout << "Average Latency: " << sum_latency / amount_of_frames << setprecision(5) << " sec" <<endl;

    return 0;
}
