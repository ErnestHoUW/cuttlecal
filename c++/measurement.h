#include <opencv2/opencv.hpp>
#include <sstream>
#include <string>
#include <tuple>

#include "image_processing.h"

using namespace cv;
using namespace std;

class Measurement {
   private:
    static Mat gray_correction_layer;  // Declaration
    static Scalar acceptable_stddev; 
    Mat measured_frame;
    Mat processed_frame;
    Scalar displayed_color_code;
    Scalar measured_color_code;
    Scalar stddev;
    //Scalar confinv_size;

   public:
    Measurement() : measured_frame(Mat()), processed_frame(Mat()), displayed_color_code(Scalar()), measured_color_code(Scalar()), stddev(Scalar()) {}
    // Other methods...
    Measurement(Mat &measured_frame, vector<Point> quadPoints, string qr_code_data) {
        // measured_frame = measured_frame.clone();
        // processed_frame = correct_gray_uniformity(measured_frame, gray_correction_layer);
        Mat local_measured_frame = measured_frame.clone();
        Mat processed_frame = correct_gray_uniformity(measured_frame, gray_correction_layer);
        measured_color_code = average_color(processed_frame, quadPoints);
        stddev = standard_deviation(measured_frame, quadPoints);
        //confinv_size = confidence_interval_size(measured_frame, quadPoints);
        //processed_frame = average_color_matrix(measured_frame, quadPoints);

        // parsing qr_code
        istringstream qr_code_ss(qr_code_data);
        string r, g, b;
        getline(qr_code_ss, r, ',');
        getline(qr_code_ss, g, ',');
        getline(qr_code_ss, b, ',');

        // Converting string to int
        displayed_color_code = Scalar(stoi(r), stoi(g), stoi(b));
    }

    Measurement(Mat &measured_frame) {
        measured_frame = measured_frame.clone();
        processed_frame = correct_gray_uniformity(measured_frame, gray_correction_layer);
    }

    Scalar get_standard_deviation() {
        return stddev;
    }

    // Scalar get_confidence_interval_size() {
    //     return confinv_size;
    // }
    Scalar get_displayed_color_code() {
        return displayed_color_code;
    }
    Mat get_processed_frame() {
        return processed_frame;
    }
    string get_csv_measurement() {
        string measurement_string;
        measurement_string += to_string((int)displayed_color_code[0]) + ",";
        measurement_string += to_string((int)displayed_color_code[1]) + ",";
        measurement_string += to_string((int)displayed_color_code[2]) + ",";
        measurement_string += to_string((double)measured_color_code[0]) + ",";
        measurement_string += to_string((double)measured_color_code[1]) + ",";
        measurement_string += to_string((double)measured_color_code[2]);
        return measurement_string;
    }
    static void set_gray_correction_layer(VideoCapture &stream) {
        tuple<Mat, Scalar> result = create_gray_correction_layer(stream);
        gray_correction_layer = get<0>(result);
        
        acceptable_stddev = get<1>(result)*1.25;
        cout<<get<1>(result)<<" < " <<acceptable_stddev<<endl;
    }
    static bool isGrayCorrectionLayerSet() {
        return !gray_correction_layer.empty();
    }
    static Scalar get_acceptable_stddev() {
        return acceptable_stddev;
    }
};

// Definition of static member outside of the class
Mat Measurement::gray_correction_layer;
Scalar Measurement::acceptable_stddev;