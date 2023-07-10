import numpy as np
from scipy.interpolate import griddata
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Define the number of points
N = 1000  

# Generate random RGB values. They should be integers within the range [0, 255].
np.random.seed(0)
R = np.random.randint(0, 256, N)
G = np.random.randint(0, 256, N)
B = np.random.randint(0, 256, N)

delta = np.random.rand(N) # Randomly generate corresponding delta values

# Define grid over which we want to evaluate the interpolator
grid_R, grid_G, grid_B = np.mgrid[0:255:256j, 0:255:256j, 0:255:256j]

# Perform the 3D interpolation
grid_delta = griddata((R, G, B), delta, (grid_R, grid_G, grid_B), method='linear')

# Now you can visualize the interpolated values
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
scatter = ax.scatter(grid_R, grid_G, grid_B, c=grid_delta.flatten(), alpha=0.5)

plt.show()