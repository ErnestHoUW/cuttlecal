import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from mpl_toolkits.mplot3d import Axes3D

def plot_hsv_cylinder(fixed_value=1.0, radius=1.0, height=1.0, resolution=360):
    # Create an array of angles from 0 to 2*pi
    theta = np.linspace(0, 2 * np.pi, resolution)

    # Create an array of radii from 0 to the specified radius
    radii = np.linspace(0, radius, resolution)

    # Create an array for the height (Value)
    height = np.linspace(0, height, resolution)

    # Create a meshgrid of theta, radii, and height
    T, R, H = np.meshgrid(theta, radii, height)

    # Convert polar coordinates to HSV colors
    # Hue varies with theta, Saturation with radii, and Value with height
    Hue = T / (2 * np.pi)
    Sat = R / radius
    Val = H / height.max()

    # Convert HSV to RGB for plotting
    RGB = mcolors.hsv_to_rgb(np.dstack((Hue, Sat, Val)))

    # Create the 3D plot
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    # Plot each slice of the cylinder with a different Value
    for i, val in enumerate(height):
        ax.contourf(T[:, :, i], R[:, :, i], val * np.ones_like(T[:, :, i]), zdir='z', colors=RGB[:, :, i, :])

    ax.set_xlim([0, 2*np.pi])
    ax.set_ylim([0, radius])
    ax.set_zlim([0, height.max()])
    ax.set_xlabel('Hue')
    ax.set_ylabel('Saturation')
    ax.set_zlabel('Value')
    ax.set_title('HSV Cylinder with Varying Value')

    plt.show()

# Plot the HSV cylinder with varying Value
plot_hsv_cylinder()
