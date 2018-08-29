with open('ru.txt','r',buffering=-1,encoding='mbcs') as f:
    for line in f:
        if '¿' not in line:
            file = open('newru.txt','a+',buffering=-1, encoding='mbcs')
            file.write(line)
            file.close()
        
