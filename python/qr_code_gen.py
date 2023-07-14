import qrcode
import cv2
import numpy as np
from PIL import Image, ImageColor, ImageOps
import time

import random

def generate_random_color():
    r = random.randint(0, 255)
    g = random.randint(0, 255)
    b = random.randint(0, 255)

    return (r, g, b)


def create_qr(qr_data, border_color):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=5,
        border=0,
    )

    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img = np.array(img.convert('RGB')) 

    # Add border to the image
    border_width = 300
    border_img = ImageOps.expand(Image.fromarray(img),border=border_width,fill=border_color)
    
    return np.array(border_img)



rgb_tuple = (100,100,100)

# Create a numpy array of shape 500x500x3, filled with the RGB tuple
image_array = np.full((500, 500, 3), rgb_tuple, dtype=np.uint8)

# OpenCV uses BGR instead of RGB, so we need to convert the color order
bgr_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
cv2.imshow('QR Code', bgr_image)
cv2.waitKey(3000)  
for i in range(100):
    rand_color=generate_random_color()

    img = create_qr(f"{rand_color[0]},{rand_color[1]},{rand_color[2]}", rand_color)
    cv2.imshow('QR Code', img)
    cv2.waitKey(50)


img = create_qr(f"end", (255,255,255))
cv2.imshow('QR Code', img)   
key=cv2.waitKey(1000)       

cv2.destroyAllWindows()  # Destroy all windows after loop ends