cmake_minimum_required(VERSION 3.5.0)
project(cuttlecal VERSION 0.1.0)

include(CTest)
enable_testing()

find_package( OpenCV REQUIRED )
find_package( Threads REQUIRED )

add_executable(cuttlecal main.cpp)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)

target_link_libraries( cuttlecal ${OpenCV_LIBS} ${CMAKE_THREAD_LIBS_INIT})
include_directories( ${OpenCV_INCLUDE_DIRS} )