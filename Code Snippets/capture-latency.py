import cv2
import time
stream = cv2.VideoCapture(0,cv2.CAP_DSHOW)

start_interval=0
sum_latency=0
amount_of_frames=1000
for i in range(amount_of_frames):
    start_interval=time.time()
    _, frame = stream.read()

    cv2.imshow("Webcam_Output", frame)

    latency = time.time() - start_interval
    sum_latency=sum_latency+latency
    
    cv2.waitKey(1)


stream.release()
cv2.destroyAllWindows

print(f"AVG Latency: {sum_latency/amount_of_frames*1000} msec")