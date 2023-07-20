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

def write_interpolated_data(file_path, points, data):
    with open(file_path, 'w', encoding='utf8', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['R displayed', 'G displayed', 'B displayed', 'R measured', 'G measured', 'B measured'])
        for i in range(len(points)):
            csv_writer.writerow(points[i] + data[i])

def griddata_interpolator(r, g, b):
    r_interpolated = float(griddata(rgb_points, red_values, (r, g, b), method='linear'))
    g_interpolated = float(griddata(rgb_points, green_values, (r, g, b), method='linear'))
    b_interpolated = float(griddata(rgb_points, blue_values, (r, g, b), method='linear'))
    return (r_interpolated, g_interpolated, b_interpolated)

def rbf_interpolate():
    rgb_space = np.linspace(0, 50, 51)
    r_grid, g_grid, b_grid = np.meshgrid(rgb_space, rgb_space, rgb_space)

    r = [rgb[0] for rgb in rgb_points]
    g = [rgb[1] for rgb in rgb_points]
    b = [rgb[2] for rgb in rgb_points]
    rbf = Rbf(r, g, b, red_values)

    return rbf(r_grid, g_grid, b_grid)


read_measurements('measurements.csv')

# rgb_range = range(125, 130)
# for r in rgb_range:
#     for g in rgb_range:
#         for b in rgb_range:
#             print(f'rgb: {(r, g, b)}, interpolated: {griddata_interpolator(r, g, b)}')
print(rbf_interpolate())

# write_interpolated_data('interpolated_measurements.csv', ???, ???)