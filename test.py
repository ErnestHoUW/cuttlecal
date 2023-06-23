import numpy as np
from tqdm import tqdm
import cv2

# Create a 3D NumPy array with shape (256, 256, 256) for each R, G, and B combination.
color_combinations = np.indices((256, 256, 256)).T.reshape(-1, 3)
stream = cv2.VideoCapture(0,cv2.CAP_DSHOW)

for color in tqdm(color_combinations[::1000]):
    ret, frame = stream.read()
    color_tuple = [int(i) for i in color]
    if not ret:
        print("No more stream :(")
        break
    cv2.rectangle(frame,(100,0),(200,100), color_tuple, -1)
    cv2.imshow("Webcam1", frame)
    pressed_key=cv2.waitKey(1)
    if pressed_key == ord('q'):
        break
stream.release()
cv2.destroyAllWindows