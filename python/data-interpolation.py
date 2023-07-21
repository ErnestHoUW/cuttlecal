import numpy as np
import csv
from scipy import interpolate
from scipy.interpolate import griddata
from scipy.interpolate import Rbf

rgb_visited = [[[False]*256 for _ in range(256)] for _ in range(256)]
rgb_points = []
red_values = []
green_values = []
blue_values = []

# parse csv into color_measurements array
# colour_measurements[R][G][B]=(R,G,B)
#   the indexes are the digital display color code
#   the tuple is the actual recorded measurement color code
def read_measurements(file_path):
    with open(file_path, encoding='utf8') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        next(csv_reader)
        for row in csv_reader:
            r, g, b = [int(val) for val in row[:3]]
            r_measured, g_measured, b_measured = [float(val) for val in row[3:]]

            if not rgb_visited[r][g][b]: 
                rgb_visited[r][g][b] = True
                rgb_points.append((r, g, b))
                red_values.append(r_measured)
                green_values.append(g_measured)
                blue_values.append(b_measured)

# def write_interpolated_data(file_path, points, data):
#     with open(file_path, 'w', encoding='utf8', newline='') as csv_file:
#         csv_writer = csv.writer(csv_file)
#         csv_writer.writerow(['R displayed', 'G displayed', 'B displayed', 'R measured', 'G measured', 'B measured'])
#         for i in range(len(points)):
#             csv_writer.writerow(points[i] + data[i])

# def griddata_interpolator(r, g, b):
#     r_interpolated = float(griddata(rgb_points, red_values, (r, g, b), method='linear'))
#     g_interpolated = float(griddata(rgb_points, green_values, (r, g, b), method='linear'))
#     b_interpolated = float(griddata(rgb_points, blue_values, (r, g, b), method='linear'))
#     return (r_interpolated, g_interpolated, b_interpolated)

def rbf_interpolate(red_points, green_points, blue_points, red_values, green_values, blue_values, rgb_space):
    r_grid, g_grid, b_grid = np.meshgrid(rgb_space, rgb_space, rgb_space)

    rbf_r = Rbf(red_points, green_points, blue_points, red_values)
    rbf_g = Rbf(red_points, green_points, blue_points, green_values)
    rbf_b = Rbf(red_points, green_points, blue_points, blue_values)

    interpolated_r = rbf_r(r_grid, g_grid, b_grid)
    interpolated_g = rbf_g(r_grid, g_grid, b_grid)
    interpolated_b = rbf_b(r_grid, g_grid, b_grid)

    with open('interpolated_measurements.csv', mode='w', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['R', 'G', 'B', 'Interpolated R', 'Interpolated G', 'Interpolated B'])
        for i in range(len(rgb_space)):
            for j in range(len(rgb_space)):
                for k in range(len(rgb_space)):
                    csv_writer.writerow([r_grid[i, j, k], g_grid[i, j, k], b_grid[i, j, k], interpolated_r[i, j, k], interpolated_g[i, j, k], interpolated_b[i, j, k]])



read_measurements('measurements.csv')
red_points = [rgb[0] for rgb in rgb_points]
green_points = [rgb[1] for rgb in rgb_points]
blue_points = [rgb[2] for rgb in rgb_points]
res = rbf_interpolate(red_points, green_points, blue_points, red_values, green_values, blue_values, np.linspace(2, 254, 64))

# rgb_range = range(125, 130)
# for r in rgb_range:
#     for g in rgb_range:
#         for b in rgb_range:
#             print(f'rgb: {(r, g, b)}, interpolated: {griddata_interpolator(r, g, b)}')
# write_interpolated_data('interpolated_measurements.csv', ???, ???)