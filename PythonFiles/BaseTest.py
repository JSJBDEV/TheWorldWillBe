seed = 1
a = 234233466321
b = 785432575563
m = 924314325657
for i in range(100):
    seed = ((seed+a)*b)%m
    print(seed)
