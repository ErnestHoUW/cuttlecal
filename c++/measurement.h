#include <opencv2/opencv.hpp>
#include <sstream>
#include <string>

#include "image_processing.h"

using namespace cv;
using namespace std;

class Measurement {
private:
    static Mat gray_correction_layer;  // Declaration
    Mat measured_frame;
    Mat processed_frame;
    Scalar displayed_color_code;
    Scalar measured_color_code;

public:
    Measurement() : measured_frame(Mat()), processed_frame(Mat()), displayed_color_code(Scalar()), measured_color_code(Scalar()) {}
    // Other methods...
    Measurement(Mat &measured_frame, vector<Point> quadPoints, string qr_code_data) {
        measured_frame=measured_frame.clone();
        processed_frame = correct_gray_uniformity(measured_frame, gray_correction_layer);
        measured_color_code = get_average_color(measured_frame, quadPoints);
        processed_frame = get_average_color_matrix(measured_frame, quadPoints);
        
        // parsing qr_code
        istringstream qr_code_ss(qr_code_data);
        string r, g, b;
        getline(qr_code_ss, r, ',');
        getline(qr_code_ss, g, ',');
        getline(qr_code_ss, b, ',');

        // Converting string to int
        displayed_color_code = Scalar(stoi(b), stoi(g), stoi(r)); // OpenCV uses BGR format
    }
    Mat get_processed_frame(){
        return processed_frame;
    }
    string get_csv_measurement() {
        string measurement_string;
        measurement_string+=to_string((int)displayed_color_code[0])+",";
        measurement_string+=to_string((int)displayed_color_code[1])+",";
        measurement_string+=to_string((int)displayed_color_code[2])+",";
        measurement_string+=to_string((double)measured_color_code[0])+",";
        measurement_string+=to_string((double)measured_color_code[1])+",";
        measurement_string+=to_string((double)measured_color_code[2])+",";
        return measurement_string;
    }
    static void set_gray_correction_layer(VideoCapture &stream) {
        gray_correction_layer = get_gray_correction_layer(stream);
    }
};

// Definition of static member outside of the class
Mat Measurement::gray_correction_layer;