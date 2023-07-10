#include <iostream>
#include <opencv2/opencv.hpp>

using namespace cv;
using namespace std;

void display(Mat &im, Mat &bbox) {
    int n = bbox.rows;
    for (int i = 0; i < n; i++) {
        line(im, Point2i(bbox.at<float>(i, 0), bbox.at<float>(i, 1)), Point2i(bbox.at<float>((i + 1) % n, 0), bbox.at<float>((i + 1) % n, 1)), Scalar(255, 0, 0), 3);
    }
}

int main() {
    Mat frame;
    namedWindow("Webcam_Output");

    VideoCapture stream(0, CAP_DSHOW);
    stream.set(CAP_PROP_SETTINGS, 1);

    if (!stream.isOpened()) {
        cout << "webcam in use";
    }

    QRCodeDetector qrDecoder = QRCodeDetector::QRCodeDetector();
   
    while (true) {
        Mat bbox, rectifiedImage;
        stream.read(frame);
        
        // string data = qrDecoder.detectAndDecode(frame, bbox, rectifiedImage);
        // if (data.length() > 0) {
        //     cout << "Decoded Data : " << data << endl;

        //     //display(frame, bbox);
        //     //rectifiedImage.convertTo(rectifiedImage, CV_8UC3);
        //     //imshow("Rectified Image", rectifiedImage);

        // }
        imshow("Webcam_Output", frame);
        char key = waitKey(1);
        if (key == 'q') {
            break;
        }
    }

    return 0;
}
