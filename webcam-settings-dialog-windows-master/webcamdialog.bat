chcp 65001 > nul
set cam="HD Pro Webcam C920"
ffmpeg -f dshow -show_video_device_dialog true -i video=%cam%
