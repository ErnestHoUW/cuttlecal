#include "image_processing.h"

tuple<Mat,Scalar> create_gray_correction_layer(VideoCapture &stream) {
    // Gray Uniformity Correction
    Mat frame;
    stream.read(frame);
    int frame_width = frame.cols;
    int frame_height = frame.rows;
    Mat average_gray_frame = Mat(frame_height, frame_width, CV_32FC3, Scalar(0, 0, 0));
    int amount_of_gray_frames = 100;
    Scalar variance_sum=Scalar(0.0,0.0,0.0);
    for (int i = 1; i <= amount_of_gray_frames; i++) {
        stream.read(frame);
        Mat mean;
        Scalar variance;
        meanStdDev(frame,mean,variance);
        for (int i = 0; i < 3; i++){
            variance_sum[i]+=variance[i];
        }
        
        for (int x = 0; x < frame_width; x++) {
            for (int y = 0; y < frame_height; y++) {
                Vec3b measured_color = frame.at<Vec3b>(y, x);
                Vec3f current_gray = average_gray_frame.at<Vec3f>(y, x);
                average_gray_frame.at<Vec3f>(y, x) = Vec3f(current_gray[0] + measured_color[0], current_gray[1] + measured_color[1], current_gray[2] + measured_color[2]);
            }
        }
    }

    for (int y = 0; y < frame_height; y++) {
        for (int x = 0; x < frame_width; x++) {
            Vec3f current_gray = average_gray_frame.at<Vec3f>(y, x);
            average_gray_frame.at<Vec3f>(y, x) = Vec3f(current_gray[0] / amount_of_gray_frames, current_gray[1] / amount_of_gray_frames, current_gray[2] / amount_of_gray_frames);
        }
    }
    Scalar variance=Scalar(0.0,0.0,0.0);
    for (int i = 0; i < 3; i++){
            variance[i]=variance_sum[i]/amount_of_gray_frames;
    }

    Scalar mean_gray = mean(average_gray_frame);
    uint mean_brightness = (uint)round((mean_gray[0] + mean_gray[1] + mean_gray[2]) / 3.0);
    average_gray_frame.convertTo(average_gray_frame, CV_8UC3);  // Convert back to CV_8UC3

    Mat gray_correction_layer = Mat(frame_height, frame_width, CV_32S);
    for (int y = 0; y < frame_height; y++) {
        for (int x = 0; x < frame_width; x++) {
            Vec3b current_gray = average_gray_frame.at<Vec3b>(y, x);
            gray_correction_layer.at<int>(y, x) = (int)mean_brightness - (int)round((current_gray[0] + current_gray[1] + current_gray[2]) / 3.0);
        }
    }
    

    return make_tuple(gray_correction_layer,variance);
}

Mat correct_gray_uniformity(Mat &frame, Mat &gray_correction_layer) {
    int frame_width = frame.cols;
    int frame_height = frame.rows;
    Mat adjusted_frame = Mat(frame_height, frame_width, CV_8UC3, Scalar(0, 0, 0));
    for (int x = 0; x < frame_width; x++) {
        for (int y = 0; y < frame_height; y++) {
            Vec3b frame_color = frame.at<Vec3b>(y, x);
            int adjustment = gray_correction_layer.at<int>(y, x);
            adjusted_frame.at<Vec3b>(y, x) = Vec3b(max(0, min(int(frame_color[0] + adjustment), 255)),
                                                   max(0, min(int(frame_color[1] + adjustment), 255)),
                                                   max(0, min(int(frame_color[2] + adjustment), 255)));
        }
    }
    return adjusted_frame;
}
vector<Point> scalePoints(vector<Point> quadPoints, int frame_width, int frame_height) {
    Point2f centroid(0.f, 0.f);
    for (const Point &point : quadPoints) {
        centroid.x += point.x;
        centroid.y += point.y;
    }
    centroid.x /= quadPoints.size();
    centroid.y /= quadPoints.size();

    double scale = 1.2;  // scaling factor

    // Create a new vector for storing scaled points
    vector<Point> scaledQuadPoints;

    // Scale each point relative to the centroid
    for (auto const &point : quadPoints) {
        int newX = static_cast<int>(centroid.x + scale * (point.x - centroid.x));
        int newY = static_cast<int>(centroid.y + scale * (point.y - centroid.y));
        newX = max(0, min(newX, frame_width - 1));
        newY = max(0, min(newY, frame_height - 1));
        scaledQuadPoints.push_back(Point(newX, newY));
    }
    return scaledQuadPoints;
}

Mat average_color_matrix(Mat &frame, vector<Point> quadPoints) {
    int frame_width = frame.cols;
    int frame_height = frame.rows;
    if (quadPoints.size() < 3) {
        cerr << "Not enough points to form a polygon" << endl;
        return frame;
    }

    Mat adjusted_frame = Mat(frame_height, frame_width, CV_8UC3, Scalar(0, 0, 0));
    Mat mask = Mat(frame_height, frame_width, CV_8U,Scalar(255));

    // Use the scaled points for operations
    vector<vector<Point>> polygons;
    polygons.push_back(scalePoints(quadPoints, frame_width, frame_height));
    fillPoly(mask, polygons, 0);

    Scalar mean_color = mean(frame, mask);  // Calculate mean using the mask

    Mat meanImage(frame_height, frame_width, CV_8UC3, Scalar(0, 0, 0));
    threshold(mask, mask, 127, 255, THRESH_BINARY);
    Scalar mean_color_rounded = Scalar(
        static_cast<int>(round(mean_color[0])),
        static_cast<int>(round(mean_color[1])),
        static_cast<int>(round(mean_color[2])));
    bitwise_not(mask,mask);
    meanImage.setTo(mean_color_rounded, mask);

    bitwise_and(frame, frame, adjusted_frame, ~mask);  // Keep parts of the original frame that are not masked
    bitwise_or(adjusted_frame, meanImage, adjusted_frame);

    adjusted_frame.convertTo(adjusted_frame, CV_8UC3);

    mask.release();  // Free up the memory space occupied by the mask

    return adjusted_frame;
}

Scalar average_color(Mat &frame, vector<Point> quadPoints) {
    int frame_width = frame.cols;
    int frame_height = frame.rows;
    Mat adjusted_frame = Mat(frame_height, frame_width, CV_8UC3, Scalar(0, 0, 0));
    Mat mask = Mat(frame_height, frame_width, CV_8U,Scalar(255));

    vector<vector<Point>> polygons;
    polygons.push_back(scalePoints(quadPoints, frame_width, frame_height));
    fillPoly(mask, polygons, 0);

    Mat rgb_frame;
    cvtColor(frame, rgb_frame, COLOR_BGR2RGB);

    Scalar mean_color = mean(rgb_frame, mask);  // Calculate mean using the mask

    return mean_color;
}

// Scalar confidence_interval_size(Mat &frame, vector<Point> quadPoints) {
//     int frame_width = frame.cols;
//     int frame_height = frame.rows;
//     Mat adjusted_frame = Mat(frame_height, frame_width, CV_8UC3, Scalar(0, 0, 0));
//     Mat mask = Mat(frame_height, frame_width, CV_8U,Scalar(255));

//     vector<vector<Point>> polygons;
//     polygons.push_back(scalePoints(quadPoints, frame_width, frame_height));
//     fillPoly(mask, polygons, 0);

//     Mat rgb_frame;
//     cvtColor(frame, rgb_frame, COLOR_BGR2RGB);

//     Scalar mean_color;
//     Scalar stddev_color;
//     meanStdDev(rgb_frame, mean_color, stddev_color, mask);
    

//     bitwise_not(mask,mask);
//     int mask_size = countNonZero(mask);
//     int frame_size = frame_width * frame_height;
//     int n = frame_size - mask_size;
//     double sqrt_n = sqrt(n);
//     cout<<stddev_color<<" , "<<n<<endl;

//     Scalar confidence_interval_size = Scalar(0.0, 0.0, 0.0);

//     for (int i = 0; i < 3; i++) {
//         double lower_limit = mean_color[i] - (z * (stddev_color[i] / sqrt_n));
//         double upper_limit = mean_color[i] + (z * (stddev_color[i] / sqrt_n));
//         confidence_interval_size[i] = upper_limit - lower_limit;
//     }
//     cout << confidence_interval_size << endl;

//     return confidence_interval_size;
// }

Scalar standard_deviation(Mat &frame, vector<Point> quadPoints) {
    int frame_width = frame.cols;
    int frame_height = frame.rows;
    Mat adjusted_frame = Mat(frame_height, frame_width, CV_8UC3, Scalar(0, 0, 0));
    Mat mask = Mat(frame_height, frame_width, CV_8U,Scalar(255));

    vector<vector<Point>> polygons;
    polygons.push_back(scalePoints(quadPoints, frame_width, frame_height));
    fillPoly(mask, polygons, 0);

    Mat rgb_frame;
    cvtColor(frame, rgb_frame, COLOR_BGR2RGB);

    Scalar mean_color;
    Scalar stddev_color;
    meanStdDev(rgb_frame, mean_color, stddev_color, mask);

    return stddev_color;
}