import cv2

stream = cv2.VideoCapture(0,cv2.CAP_DSHOW)
print(stream.get(cv2.CAP_PROP_EXPOSURE))
stream.set(cv2.CAP_PROP_EXPOSURE, -2) 
stream.set(cv2.CAP_PROP_SETTINGS, 0)

start_interval=0
sum_latency=0
amount_of_frames=1000
for i in range(amount_of_frames):
    _, frame = stream.read()

    cv2.imshow("Webcam_Output", frame)
    cv2.waitKey(1)


stream.release()
cv2.destroyAllWindows
