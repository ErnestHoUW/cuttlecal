import cv2

stream = cv2.VideoCapture(0,cv2.CAP_DSHOW)
stream.set(cv2.CAP_PROP_EXPOSURE, 0) 

stream.release()