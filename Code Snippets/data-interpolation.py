import numpy as np
from scipy import interpolate
colour_measurements=np.zeros(255,255,255)

# parse csv into color_measurements array
# colour_measurements[R][G][B]=(R,G,B)
#   the indexes are the digital display color code
#   the tuple is the actual recorded measurement color code


red_measurements=np.zeros(255,255,255)
green_measurements=np.zeros(255,255,255)
blue_measurements=np.zeros(255,255,255)


for r in range(255):
    for g in range(255):
        for b in range(255):
            red_measurements[r][g][b]=colour_measurements[r][g][b][0]
            green_measurements[r][g][b]=colour_measurements[r][g][b][1]
            blue_measurements[r][g][b]=colour_measurements[r][g][b][2]
            
r = np.linspace(0, 255, 256)
g = np.linspace(0, 255, 256)
b = np.linspace(0, 255, 256)

points = (r,g,b)

red_interpolater=interpolate.RegularGridInterpolator(points,
                                                     red_measurements,
                                                     method='linear')
green_interpolater=interpolate.RegularGridInterpolator(points,
                                                       green_measurements,
                                                       method='linear')
blue_interpolater=interpolate.RegularGridInterpolator(points,
                                                      blue_measurements,
                                                      method='linear')

def colour_interpolator(r,g,b):
    colour_input=np.array([[r,g,b]])
    return (red_interpolater(colour_input)[0],
            green_interpolater(colour_input)[0],
            blue_interpolater(colour_input)[0])
