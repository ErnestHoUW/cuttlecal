cmake_minimum_required(VERSION 3.5.0)
project(cuttlecal VERSION 0.1.0)

# Enable testing
include(CTest)
enable_testing()

# Find required packages
find_package(OpenCV REQUIRED)
find_package(Threads REQUIRED)

# Include directories
include_directories(${OpenCV_INCLUDE_DIRS})

add_subdirectory(zxing-cpp) 

# Add the executable
add_executable(cuttlecal main.cpp image_processing.cpp)

# Link against the necessary libraries
target_link_libraries(cuttlecal ZXing::ZXing ${OpenCV_LIBS} ${CMAKE_THREAD_LIBS_INIT}) # Updated line

# Set up CPack for packaging
set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)