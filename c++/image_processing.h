#include <cmath>
#include <opencv2/opencv.hpp>
#include <tuple>

using namespace cv;
using namespace std;

const double confidence_level = 0.9999;
const double z = 3.891;

tuple<Mat, Scalar> create_gray_correction_layer(VideoCapture &stream);
Mat correct_gray_uniformity(Mat &frame, Mat &gray_correction_layer);
Mat average_color_matrix(Mat &frame, vector<Point> quadPoints);
Scalar average_color(Mat &frame, vector<Point> quadPoints);
// Scalar confidence_interval_size(Mat &frame, vector<Point> quadPoints);
Scalar standard_deviation(Mat &frame, vector<Point> quadPoints);