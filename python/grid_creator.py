# For loop to print numbers from 0 to 255 for each step
tuples = [(x, y, z) for x in range(0, 256, 15) 
                    for y in range(0, 256, 15) 
                    for z in range(0, 256, 15)]

print(tuples)

# (255/1)^3=16581375
# (255/3)^3=614125
# (255/5)^3=132651
