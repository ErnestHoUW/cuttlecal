#include <opencv2/opencv.hpp>

using namespace cv;
using namespace std;

Mat get_gray_correction_layer(VideoCapture &stream);
Mat correct_gray_uniformity(Mat &frame, Mat &gray_correction_layer);
Mat get_color_average_matrix(Mat &frame, vector<Point> quadPoints);
Scalar get_average_color(Mat &frame, vector<Point> quadPoints);