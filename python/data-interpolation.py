import math

import numpy as np
import csv
import time
from scipy import interpolate
from scipy.interpolate import griddata
from scipy.interpolate import Rbf


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
def rbf_interpolate_3(red_points, green_points, blue_points, red_values, green_values, blue_values, rgb_space):
    rbf_r = Rbf(red_points, green_points, blue_points, red_values)
    rbf_g = Rbf(red_points, green_points, blue_points, green_values)
    rbf_b = Rbf(red_points, green_points, blue_points, blue_values)

    print(','.join(['R', 'G', 'B', 'Interpolated R', 'Interpolated G', 'Interpolated B']))

    for g in rgb_space:
        for r in rgb_space:
            for b in rgb_space:
                interpolated_r = rbf_r(r, g, b)
                interpolated_g = rbf_g(r, g, b)
                interpolated_b = rbf_b(r, g, b)

                print(
                    ','.join(map(str, [int(r), int(g), int(b), truncate(interpolated_r, 4), truncate(interpolated_g, 4),
                                       truncate(interpolated_b, 4)])))


def rbf_interpolate_2(red_points, green_points, blue_points, red_values, green_values, blue_values, rgb_space,
                      batch_size):
    rbf_r = Rbf(red_points, green_points, blue_points, red_values)
    rbf_g = Rbf(red_points, green_points, blue_points, green_values)
    rbf_b = Rbf(red_points, green_points, blue_points, blue_values)

    with open('interpolated_measurements-2.2.csv', mode='w', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['R', 'G', 'B', 'Interpolated R', 'Interpolated G', 'Interpolated B'])

        rows = []  # List to store rows in batch
        for g in rgb_space:  # changed order of loop so i can diff with old rbf interpolate func
            for r in rgb_space:
                for b in rgb_space:
                    interpolated_r = rbf_r(r, g, b)
                    interpolated_g = rbf_g(r, g, b)
                    interpolated_b = rbf_b(r, g, b)

                    # Append row to batch
                    rows.append([int(r), int(g), int(b), truncate(interpolated_r, 4), truncate(interpolated_g, 4),
                                 truncate(interpolated_b, 4)])

                    # If batch size is reached, write to file and clear batch
                    if len(rows) == batch_size:
                        csv_writer.writerows(rows)
                        rows = []

        # Write any remaining rows in batch
        if rows:
            csv_writer.writerows(rows)


def rbf_interpolate(red_points, green_points, blue_points, red_values, green_values, blue_values, rgb_space):
    r_grid, g_grid, b_grid = np.meshgrid(rgb_space, rgb_space, rgb_space)

    rbf_r = Rbf(red_points, green_points, blue_points, red_values)
    rbf_g = Rbf(red_points, green_points, blue_points, green_values)
    rbf_b = Rbf(red_points, green_points, blue_points, blue_values)

    interpolated_r = rbf_r(r_grid, g_grid, b_grid)
    interpolated_g = rbf_g(r_grid, g_grid, b_grid)
    interpolated_b = rbf_b(r_grid, g_grid, b_grid)

    with open('interpolated_measurements.2.csv', mode='w', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['R', 'G', 'B', 'Interpolated R', 'Interpolated G', 'Interpolated B'])
        for i in range(len(rgb_space)):
            for j in range(len(rgb_space)):
                for k in range(len(rgb_space)):
                    csv_writer.writerow([int(r_grid[i, j, k]), int(g_grid[i, j, k]), int(b_grid[i, j, k]),
                                         truncate(interpolated_r[i, j, k], 4),
                                         truncate(interpolated_g[i, j, k], 4),
                                         truncate(interpolated_b[i, j, k], 4)])


def truncate(number, decimals):
    factor = 10.0 ** decimals
    return float(str(math.trunc(factor * number) / factor))


if __name__ == '__main__':
    rgb_visited = [[[False] * 256 for _ in range(256)] for _ in range(256)]
    rgb_points = []
    red_values = []
    green_values = []
    blue_values = []

    # parse csv into color_measurements array
    # colour_measurements[R][G][B]=(R,G,B)
    #   the indexes are the digital display color code
    #   the tuple is the actual recorded measurement color code

    t = time.time()
    read_measurements('measurements.csv')
    red_points = [rgb[0] for rgb in rgb_points]
    green_points = [rgb[1] for rgb in rgb_points]
    blue_points = [rgb[2] for rgb in rgb_points]
    t1 = time.time()

    # Uncomment some stuff to run it

    print("--- %s seconds ---" % (t1 - t))
    # rbf_interpolate(red_points, green_points, blue_points, red_values, green_values, blue_values,
    #                 np.linspace(2, 254, 64))
    t2 = time.time()
    print("--- %s seconds ---" % (t2 - t1))
    # rbf_interpolate_2(red_points, green_points, blue_points, red_values, green_values, blue_values,
    #                   np.linspace(0, 255, 256), 4096)
    # print("--- %s seconds ---" % (time.time() - t2))
    t3 = time.time()
    rbf_interpolate_2(red_points, green_points, blue_points, red_values, green_values, blue_values,
                      np.linspace(2, 254, 64), 1000)
    print("--- %s seconds ---" % (time.time() - t3))




    # rgb_range = range(125, 130)
    # for r in rgb_range:
    #     for g in rgb_range:
    #         for b in rgb_range:
    #             print(f'rgb: {(r, g, b)}, interpolated: {griddata_interpolator(r, g, b)}')
    # write_interpolated_data('interpolated_measurements.csv', ???, ???)
