import cv2
import matplotlib.pyplot as plt
import numpy as np

stream = cv2.VideoCapture(0,cv2.CAP_DSHOW)
stream.set(cv2.CAP_PROP_FRAME_WIDTH, 480)
stream.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
print("hihi")

if not stream.isOpened():
    print("No Stream :(")
    exit()

color_measurements = np.zeros((255,255,255))

while(True):
    ret, frame = stream.read()
    if not ret:
        print("No more stream :(")
        break

    frame_height, frame_width, _ = frame.shape

    pixel_x = frame_height//2
    pixel_y = frame_width//2
    square_size = 50     # Adjust as desired
    half_size = square_size // 2

    pixel_color_bgr = [int(i) for i in frame[pixel_y, pixel_x]]
    pixel_color_rgb = pixel_color_bgr[::-1]
    print(f"R: 000 G: 000 B: 000", end='\r')
    print(f"R: {pixel_color_rgb[0]:03} G: {pixel_color_rgb[1]:03} B: {pixel_color_rgb[2]:03}", end='\r')

    top_left = (pixel_x - half_size, pixel_y - half_size)
    bottom_right = (pixel_x + half_size, pixel_y + half_size)

    cv2.rectangle(frame,(0,0),(100,100), tuple(pixel_color_bgr), -1) #-1 fills the rectangle
    cv2.rectangle(frame,(100,0),(200,100), (255,255,255), -1)

    cv2.rectangle(frame, top_left, bottom_right, (0, 255, 0), 2)

    cv2.imshow("Webcam1", frame)
    pressed_key=cv2.waitKey(1)
    if pressed_key == ord('q'):
        break
    if pressed_key == ord('y'):
        print("とる!")
        cv2.imwrite('images/c1.png',frame)

stream.release()
cv2.destroyAllWindows