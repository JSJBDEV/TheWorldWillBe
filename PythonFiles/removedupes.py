lon = 0.0
lat = 0.0
with open('cn.txt','r',buffering=-1,encoding='mbcs') as f:
    for line in f:
        vs = line.split(",");
        if(vs[5] != lat and vs[6] != lon):
            file = open(vs[0]+'.csv','a+',buffering=-1, encoding='mbcs')
            file.write(line)
            file.close()
            lon = vs[6]
            lat = vs[5]
