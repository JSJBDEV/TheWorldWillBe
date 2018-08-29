import os
for filename in os.listdir('countries'):
    number_lines = sum(1 for line in open("countries/"+filename,"r",buffering=-1, encoding='mbcs'))
    file = open("numberofcities.txt","a+",buffering=-1, encoding='mbcs')
    file.write(filename+","+str(number_lines)+"\n")
    file.close()
