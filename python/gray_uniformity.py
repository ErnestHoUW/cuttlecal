import numpy as np
import cv2
# Define RGB tuple
rgb_tuple = (100,100,100) # White for example

# Create a numpy array of shape 500x500x3, filled with the RGB tuple
image_array = np.full((500, 500, 3), rgb_tuple, dtype=np.uint8)

# OpenCV uses BGR instead of RGB, so we need to convert the color order
bgr_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)

# Display the image
cv2.imshow('Image', bgr_image)

# Wait indefinitely until the user closes the window
cv2.waitKey(0)

# Close all windows
cv2.destroyAllWindows()