#include "image_processing.h"
Mat get_gray_correction_layer(VideoCapture &stream) {
    // Gray Uniformity Correction
    Mat frame;
    stream.read(frame);
    int frame_width = frame.cols;
    int frame_height = frame.rows;
    Mat average_gray_frame = Mat(frame_height, frame_width, CV_32FC3, Scalar(0, 0, 0));
    int amount_of_gray_frames = 100;
    for (int i = 1; i <= amount_of_gray_frames; i++) {
        stream.read(frame);
        imshow("Webcam Ouptut1", frame);
        for (int x = 0; x < frame_width; x++) {
            for (int y = 0; y < frame_height; y++) {
                Vec3b measured_color = frame.at<Vec3b>(y, x);
                Vec3f current_gray = average_gray_frame.at<Vec3f>(y, x);
                average_gray_frame.at<Vec3f>(y, x) = Vec3f(current_gray[0] + measured_color[0], current_gray[1] + measured_color[1], current_gray[2] + measured_color[2]);
            }
        }
        frame.release();
        waitKey(1);
    }

    for (int y = 0; y < frame_height; y++) {
        for (int x = 0; x < frame_width; x++) {
            Vec3f current_gray = average_gray_frame.at<Vec3f>(y, x);
            average_gray_frame.at<Vec3f>(y, x) = Vec3f(current_gray[0] / amount_of_gray_frames, current_gray[1] / amount_of_gray_frames, current_gray[2] / amount_of_gray_frames);
        }
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

    return gray_correction_layer;
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

Mat get_average_color_matrix(Mat &frame, vector<Point> quadPoints) {
    int frame_width = frame.cols;
    int frame_height = frame.rows;
    if (quadPoints.size() < 3) {
        cerr << "Not enough points to form a polygon" << endl;
        return frame;
    }

    cv::Mat adjusted_frame = cv::Mat(frame_height, frame_width, CV_8UC3, cv::Scalar(0, 0, 0));
    cv::Mat mask = cv::Mat::ones(frame_height, frame_width, CV_8U);

    cv::Point2f centroid(0.f, 0.f);
    for (const cv::Point &point : quadPoints) {
        centroid.x += point.x;
        centroid.y += point.y;
    }
    centroid.x /= quadPoints.size();
    centroid.y /= quadPoints.size();

    double scale = 1.2;  // scaling factor

    // Create a new vector for storing scaled points
    vector<cv::Point> scaledQuadPoints;

    // Scale each point relative to the centroid
    for (auto const &point : quadPoints) {
        int newX = static_cast<int>(centroid.x + scale * (point.x - centroid.x));
        int newY = static_cast<int>(centroid.y + scale * (point.y - centroid.y));
        newX = max(0, min(newX, frame_width - 1));
        newY = max(0, min(newY, frame_height - 1));
        scaledQuadPoints.push_back(cv::Point(newX, newY));
    }

    // Use the scaled points for operations
    vector<vector<cv::Point>> polygons;
    polygons.push_back(scaledQuadPoints);
    cv::fillPoly(mask, polygons, 255);

    cv::Scalar mean_color = cv::mean(frame, mask);  // Calculate mean using the mask

    cv::Mat meanImage(frame_height, frame_width, CV_8UC3, cv::Scalar(0, 0, 0));
    cv::threshold(mask, mask, 127, 255, cv::THRESH_BINARY);
    cv::Scalar mean_color_rounded = cv::Scalar(
        static_cast<int>(round(mean_color[0])),
        static_cast<int>(round(mean_color[1])),
        static_cast<int>(round(mean_color[2])));
    meanImage.setTo(mean_color_rounded, mask);

    cv::bitwise_and(frame, frame, adjusted_frame, ~mask);  // Keep parts of the original frame that are not masked
    cv::bitwise_or(adjusted_frame, meanImage, adjusted_frame);

    adjusted_frame.convertTo(adjusted_frame, CV_8UC3);

    mask.release();  // Free up the memory space occupied by the mask

    return adjusted_frame;
}

Scalar get_average_color(Mat &frame, vector<Point> quadPoints) {
    int frame_width = frame.cols;
    int frame_height = frame.rows;
    Mat adjusted_frame = Mat(frame_height, frame_width, CV_8UC3, Scalar(0, 0, 0));
    Mat mask = Mat::ones(frame_height, frame_width, CV_8U);

    vector<vector<cv::Point>> polygons;
    polygons.push_back(quadPoints);
    cv::fillPoly(mask, polygons, 255);

    Scalar mean_color = mean(frame, mask);  // Calculate mean using the mask

    return mean_color;
}