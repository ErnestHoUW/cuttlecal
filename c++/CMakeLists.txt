cmake_minimum_required(VERSION 3.5)
project(cuttlecal VERSION 1.0)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(OpenCV_DIR "${VCPKG_INSTALLED_DIR}/x64-windows/share/opencv4")

# Find packages
find_package(OpenCV 4 REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(ZXing REQUIRED) # This line finds ZXing

# Include directories
include_directories(${OpenCV_INCLUDE_DIRS})

# Add your source files here
add_executable(cuttlecal main.cpp image_processing.cpp)

# Link libraries
target_link_libraries(cuttlecal PRIVATE ${OpenCV_LIBS})
target_link_libraries(cuttlecal PRIVATE nlohmann_json nlohmann_json::nlohmann_json)
target_link_libraries(cuttlecal PRIVATE ZXing::Core ZXing::ZXing) # Linking ZXing library
