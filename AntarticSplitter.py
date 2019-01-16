from bs4 import BeautifulSoup
file = open("AntarticBasesTableDump.html","r+",buffering=-1, encoding='mbcs')
stew = file.read()
soup = BeautifulSoup(stew)
results = soup.findAll(attrs={"class" : "geo","a":"href"})
print(results)
file.close()
