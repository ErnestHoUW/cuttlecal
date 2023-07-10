import qrcode
import cv2
import numpy as np
import time

import random

def generate_random_color():
    r = random.randint(0, 255)
    g = random.randint(0, 255)
    b = random.randint(0, 255)

    return (r, g, b)

def create_qr(qr_data,color):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=2,
        border=50,
    )
    
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color=color)
    img = np.array(img)  # Convert image to grayscale
    
    return img  # Invert image colors to match OpenCV expectations
while(1):
    rand_color=generate_random_color()

    img = create_qr(f"({rand_color[0]},{rand_color[1]},{rand_color[2]})", rand_color)
    cv2.imshow('QR Code', img)
    key=cv2.waitKey(100)  # Pause for 1 second
    if key=='q':
        break
            

cv2.destroyAllWindows()  # Destroy all windows after loop ends