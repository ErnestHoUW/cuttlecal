cmake_minimum_required(VERSION 3.0.0)
project(cuttlecal VERSION 0.1.0)

# Enable testing
include(CTest)
enable_testing()

# Add the executable
add_executable(cuttlecal main.cpp image_processing.cpp)

set(CMAKE_TOOLCHAIN_FILE C:/vcpkg/scripts/buildsystems/vcpkg.cmake)
# set(CMAKE_PREFIX_PATH "C:/vcpkg/installed/x64-windows/share")
# set(VCPKG_TARGET_TRIPLET "x64-windows")


# Find required packages
find_package(OpenCV REQUIRED)
find_package(Threads REQUIRED)
find_package(CURL REQUIRED)
# find_package(ZXing CONFIG REQUIRED)

# Include directories
include_directories(${OpenCV_INCLUDE_DIRS})

INCLUDE_DIRECTORIES(C:/vcpkg/installed/x64-windows/include)
LINK_DIRECTORIES(C:/vcpkg/installed/x64-windows/lib) 

add_subdirectory(zxing-cpp) 

# Link against the necessary libraries
target_link_libraries(cuttlecal ${OpenCV_LIBS} ${CMAKE_THREAD_LIBS_INIT} ZXing::ZXing CURL::libcurl) # Updated line

# Set up CPack for packaging
set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)