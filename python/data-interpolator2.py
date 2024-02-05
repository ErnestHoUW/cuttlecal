
import numpy as np
import csv
import csv
from scipy.spatial import KDTree
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from scipy.ndimage import gaussian_filter
from matplotlib.animation import FuncAnimation, FFMpegWriter
from matplotlib.colors import LightSource
from concurrent.futures import ThreadPoolExecutor

def idw_interpolation(kdtree, values, query_points, k=10, p=2):
    # Find k nearest neighbors for each query point
    distances, indices = kdtree.query(query_points, k=k)
    
    # Avoid division by zero
    distances[distances == 0] = 1e-12
    
    # Calculate weights based on inverse distance
    weights = 1 / distances**p
    
    # Compute weighted average of values
    interpolated_values = np.sum(weights * values[indices], axis=1) / np.sum(weights, axis=1)
    
    return interpolated_values

def parallel_idw_interpolation(kdtree, values, grid_points_chunks, k=10, p=2):
    def interpolate_chunk(chunk):
        distances, indices = kdtree.query(chunk, k=k)
        distances[distances == 0] = 1e-12  # Avoid division by zero
        weights = 1 / distances**p
        return np.sum(weights * values[indices], axis=1) / np.sum(weights, axis=1)
    
    interpolated_values = []
    with ThreadPoolExecutor() as executor:
        results = executor.map(interpolate_chunk, grid_points_chunks)
        for result in results:
            interpolated_values.extend(result)
    
    return np.array(interpolated_values)

def read_measurements(file_path):
    rgb_visited = [[[False] * 256 for _ in range(256)] for _ in range(256)]
    rgb_points = []
    red_values = []
    green_values = []
    blue_values = []

    with open(file_path, encoding='utf8') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        next(csv_reader)  # Skip the header
        for row in csv_reader:
            r, g, b = [int(val) for val in row[:3]]
            r_measured, g_measured, b_measured = [float(val) for val in row[3:]]

            if not rgb_visited[r][g][b]:
                rgb_visited[r][g][b] = True
                rgb_points.append((r, g, b))
                red_values.append(r_measured)
                green_values.append(g_measured)
                blue_values.append(b_measured)

    return rgb_points, red_values, green_values, blue_values

def interpolate_values(method, points, values):
    """
    Interpolate values using the specified method.

    Parameters:
    - method: The interpolation method ('idw' for Inverse Distance Weighting, others can be added)

    Returns:
    - interpolated_values: The interpolated values at the grid points
    """
    if method == 'idw':
                # Create a KDTree with your points
        kdtree = KDTree(points)

        # Define the 3D grid for RGB space
        grid_x, grid_y, grid_z = np.mgrid[0:256, 0:256, 0:256]
        grid_points = np.vstack([grid_x.ravel(), grid_y.ravel(), grid_z.ravel()]).T

        # Perform IDW interpolation
        interpolated_values = idw_interpolation(kdtree, values, grid_points, k=10)  # Adjust 'k' as needed

        # Reshape interpolated values back to the 3D grid shape
        interpolated_values_3d = interpolated_values.reshape(grid_x.shape)

        return interpolated_values_3d
    elif method == 'parallel_idw':
                # Create a KDTree with your points
        kdtree = KDTree(points)

        # Define the 3D grid for RGB space
        grid_x, grid_y, grid_z = np.mgrid[0:256, 0:256, 0:256]
        grid_points = np.vstack([grid_x.ravel(), grid_y.ravel(), grid_z.ravel()]).T
        grid_points_chunks = np.array_split(grid_points, 10)

        # Perform IDW interpolation
        interpolated_values = parallel_idw_interpolation(kdtree, values, grid_points_chunks, k=10)
        interpolated_values_3d = interpolated_values.reshape(grid_x.shape)

        return interpolated_values_3d
    # Placeholder for another interpolation method
    # elif method == 'another_method':
    #     return another_interpolation_method(...)
    else:
        raise ValueError("Unsupported interpolation method.")

# Read measurements from the first file
rgb_points1, red_values1, green_values1, blue_values1 = read_measurements('measurements_lights_off.csv')

# Read measurements from the second file
rgb_points2, red_values2, green_values2, blue_values2 = read_measurements('measurements_lights_on.csv')
# Initialize a list to hold the points that are present in both rgb_points1 and rgb_points2
common_points = []

# Initialize lists to hold the differences
red_diffs = []
green_diffs = []
blue_diffs = []

# Convert rgb_points2 to a set for faster lookups
rgb_points2_set = set(rgb_points2)

# Iterate through the points in the first list
for i, point in enumerate(rgb_points1):
    if point in rgb_points2_set:
        # Find the index of the point in the second list
        j = rgb_points2.index(point)
        
        # Store the common point
        common_points.append(point)
        
        # Calculate the differences in color values
        red_diff = red_values1[i] - red_values2[j]
        green_diff = green_values1[i] - green_values2[j]
        blue_diff = blue_values1[i] - blue_values2[j]

        # Store the differences
        red_diffs.append(red_diff)
        green_diffs.append(green_diff)
        blue_diffs.append(blue_diff)

# for i, point in enumerate(common_points):
#     if (point[2] == 15):
#         print(f"Point: {point}, Red diff: {red_diffs[i]}, Green diff: {green_diffs[i]}, Blue diff: {blue_diffs[i]}")

# Step 1: Interpolate with griddata
points = np.array(common_points)  # Convert to numpy array for griddata
red_values = np.array(red_diffs)  # Red color differences
green_values = np.array(green_diffs)  # Red color differences
blue_values = np.array(blue_diffs)  # Red color differences

# Interpolate values for each color channel
interpolated_reds = interpolate_values("parallel_idw", points, red_values)
interpolated_greens = interpolate_values("parallel_idw", points, green_values)
interpolated_blues = interpolate_values("parallel_idw", points, blue_values)

def animate_graph(interpolated_reds, interpolated_greens, interpolated_blues):
    x = np.arange(0, 256)
    y = np.arange(0, 256)
    X, Y = np.meshgrid(x, y)
    
    Z_max = max(interpolated_reds.max(), interpolated_greens.max(), interpolated_blues.max())
    Z_min = min(interpolated_reds.min(), interpolated_greens.min(), interpolated_blues.min())

    fig = plt.figure(figsize=(15, 5))

    # Create subplots for each color channel
    ax_red = fig.add_subplot(131, projection='3d')
    ax_green = fig.add_subplot(132, projection='3d')
    ax_blue = fig.add_subplot(133, projection='3d')

    axes = [ax_red, ax_green, ax_blue]

    # Set titles and labels for each subplot
    ax_red.set_title('Red Channel')
    ax_green.set_title('Green Channel')
    ax_blue.set_title('Blue Channel')

    for ax in axes:
        ax.set_xlim(0, 255)
        ax.set_ylim(0, 255)
        ax.set_zlim(Z_min, Z_max)
        ax.set_xlabel('Red Value')
        ax.set_ylabel('Green Value')
        ax.set_zlabel('Difference')

    def update_plot(frame):
        for ax, interpolated_values_3d,title in zip(axes, [interpolated_reds, interpolated_greens, interpolated_blues], ['Red Channel', 'Green Channel', 'Blue Channel']):
            ax.clear()
            Z = interpolated_values_3d[:, :, frame]
            Z_smoothed = gaussian_filter(Z, sigma=2)
            
            # Create an RGB array based on X, Y, and the current frame
            colors = np.zeros((256, 256, 3))
            colors[:, :, 0] = X / 255  # Red from X
            colors[:, :, 1] = Y / 255  # Green from Y
            colors[:, :, 2] = frame / 255  # Blue from the current frame
            
            # Plot the surface with the RGB colors
            ax.plot_surface(X.T, Y.T, Z_smoothed, facecolors=colors, edgecolor='none')
            ax.set_xlim(0, 255)
            ax.set_ylim(0, 255)
            ax.set_zlim(Z_min, Z_max)
            ax.set_xlabel('Red Value')
            ax.set_ylabel('Green Value')
            ax.set_zlabel('Difference')
            # Reapply the title after clearing
            ax.set_title(title + f"(Blue={frame})")

    ani = FuncAnimation(fig, update_plot, frames=range(0, 256), interval=30)

    plt.show()

# Call the function with interpolated values for each color channel
animate_graph(interpolated_reds, interpolated_greens, interpolated_blues)
