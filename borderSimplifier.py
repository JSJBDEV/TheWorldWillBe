with open('rawBorderCountries.txt','r') as f:
    for line in f:
        if(line != 'Includes: \n'):
            if(line[len(line)-2] == ';'):
                country = line[0:line.find(';',0)]
                file = open('CountryBorders.txt','a+')
                file.write('\n'+country+',')
                file.close()
            else:
                file = open('CountryBorders.txt','a+')
                file.write(line[0:line.find(':',0)]+',')
                file.close()
            
            
        
