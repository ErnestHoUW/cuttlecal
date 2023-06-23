import cv2
import time
stream = cv2.VideoCapture(0,cv2.CAP_DSHOW)

start_interval=0
sum_latency=0
frames=0
while(True):
    start_interval=time.time()
    ret, frame = stream.read()
    if not ret:
        #Webcam disconnect or used by another application
        break

    cv2.imshow("Webcam_Output", frame)

    latency = time.time() - start_interval
    sum_latency=sum_latency+latency
    frames=frames+1
    
    pressed_key=cv2.waitKey(1)
    if pressed_key == ord('q'):
        break

stream.release()
cv2.destroyAllWindows

print(f"Average Latency: {sum_latency/frames}")