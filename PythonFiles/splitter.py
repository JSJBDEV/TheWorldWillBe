with open('worldcitiespop.txt','r',buffering=-1,encoding='mbcs') as f:
    for line in f:
        vs = line.split(",");
        file = open(vs[0]+'.txt','a+',buffering=-1, encoding='mbcs')
        file.write(line)
        file.close()
        
