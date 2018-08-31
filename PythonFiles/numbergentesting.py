import math
global A,B,M,X
A = 69243243243
B = 12313213455
M = 91346134677
X = 1

def getNumberForYear(year):
    global A,B,M,X
    for i in range(year):
        X = ((X+A)*B)%M
    return X

def newState(year):
    ynum = getNumberForYear(year)
    numbers = int(str(ynum)[0:2]) #first 2 numbers
    print(numbers)
    if(numbers > 70):
        print("new state formed")
        numbers = int(str(ynum)[1:4]) #hence a number between 000 and 999 inclusive.
        if(numbers == 000):
            numbers = 1000
        while(numbers>235):
            numbers = numbers - 235
        print(numbers) #this refers to the actual country, some of the files are outdated but I have 235 regions.

        #this next section will work based on a seperate list of filesizes/amount of lines in a file.
        #getLineAmountFromID(numbers)
        lineamount = 50
        if(lineamount < 100):
            #use 2 numbers, recursively reduce (by max)
        if(lineamount < 1000):
            #use 3 numbers, recursively reduce
        if(lineamount < 10000)
            #use 4 numbers, recursively reduce
        if(lineamount < 100000)
            #use 5 numbers, recursively reduce
        else:
            #use 6 numbers,recursively reduce
        #etc, some countries are consideraby larger files than the rest, so may get a specifc generator.
        
        
        
for i in range(100):
    newState(i)

