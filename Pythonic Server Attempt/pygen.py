import urllib.request, math
global year,towns
year = 0
towns = []
send = []
def baseGenerator(year):
    seed = 1
    A = 234233466321
    B = 785432575563
    M = 924314325657
    for v in range(year):
        seed = math.fmod((seed+A)*B,M)
    return seed


def fitRecursively(inp,lim):
    while inp >= lim:
        inp = inp - lim
    return inp

def getFile(filename):
    file = open("github/"+filename,"r",buffering=-1, encoding="mbcs")
    re = file.read()
    fi = re.split("\n")
    return fi



def genTownForYear():
    seed = baseGenerator(year)
    if int(str(seed)[0:2])>70:
        file = getFile("numberofcities.txt")
        cid = fitRecursively(int(str(seed)[1:4]),235)
        cline = file[cid]
        
        ccode = cline.split(",")[0]
        file = getFile("countries/"+ccode+".txt")
        tid = fitRecursively(int(str(seed)[2:9]),int(cline.split(",")[1]))
        town = file[int(tid)];
        tsplit = town.split(",")
        townObject = {
                "realName":tsplit[1].replace("'","`"),
                "realCountry":tsplit[0],
                "foundedYear":year,
                "realRegion":tsplit[3],
                "latitude":tsplit[5],
                "longitude":tsplit[6],
                "townseed":baseGenerator(222+len(towns)),
                "happiness":100,
                "devLevel":100,
                "population":1,
                "foodMod":5,
                "resources":int(str(baseGenerator(222+len(towns)))[4:6]),
                "branchedFrom":"NA",
                "partOf":tsplit[1].replace("'","`")
            }
        #print(townObject)
        towns.append(townObject)
        send.append(townObject["realName"]+" starts")

def genBranchTown(parent):
    seed = baseGenerator(year)
    file = getFile("countries/"+parent["realCountry"]+".txt")
    region = []
    for i in range(len(file)-1):
        if file[i].split(",")[3] == parent["realRegion"]:
            region.append(file[i])
    tid = fitRecursively(int(str(seed)[2:9]),len(region))
    town = file[int(tid)];
    tsplit = town.split(",")
    townObject = {
            "realName":tsplit[1].replace("'","`"),
            "realCountry":tsplit[0],
            "foundedYear":year,
            "realRegion":tsplit[3],
            "latitude":tsplit[5],
            "longitude":tsplit[6],
            "townseed":baseGenerator(222+len(towns)),
            "happiness":100,
            "devLevel":100,
            "population":1,
            "foodMod":5,
            "resources":int(str(baseGenerator(222+len(towns)))[4:6]),
            "branchedFrom":parent["realName"],
            "partOf":parent["partOf"]
        }
    #print(townObject)
    towns.append(townObject)
    send.append(townObject["realName"]+" starts")
    parent["resources"] = parent["resources"] + townObject["resources"]

def townIterate():
    for i in range(len(towns)-1):
        try:
            ratioseed = math.fmod(towns[i]["townseed"],baseGenerator(year))
            towns[i]["foodMod"] = int(str(ratioseed)[1:2])+1
        except:
            continue
        
        if towns[i]["branchedFrom"] != "NA":
            for v in range(len(towns)-1):
                if towns[v]["realName"] == towns[i]["branchedFrom"]:
                    parentTown = towns[v]
                    break
        else:
            parentTown = towns[i]
        if towns[i]["foodMod"] == 2 or towns[i]["foodMod"] == 3:
            parentTown["resources"] = parentTown["resources"]-1
        if towns[i]["foodMod"] == 8 or towns[i]["foodMod"] == 9:
            parentTown["resources"] = parentTown["resources"]+1
        if towns[i]["foodMod"] == 1:
            parentTown["resources"] = parentTown["resources"]-2
        if towns[i]["foodMod"] == 10:
            parentTown["resources"] = parentTown["resources"]+2
            
        towns[i]["population"] = towns[i]["population"] + math.floor((int(str(towns[i]["townseed"])[1])*(year-towns[i]["foundedYear"]+1))/2)
        towns[i]["devLevel"] = towns[i]["devLevel"] + int(str(baseGenerator(year))[2:4]) + math.floor(0.1*int(str(towns[i]["townseed"])[1:3]))

        if(int(str(ratioseed)[3:5]) >=50):
            towns[i]["happiness"] = towns[i]["happiness"] + 1
        else:
            towns[i]["happiness"] = towns[i]["happiness"] - 1
            
        if(towns[i]["devLevel"]<parentTown["devLevel"]):
            parentTown["resources"] = parentTown["resources"] - 1

        if(towns[i]["resources"]<0):
            delist = []
            for q in range(len(towns)):
                if(towns[q]["partOf"] == towns[i]["partOf"]):
                    send.append(towns[q]["realName"]+" is removed")
                    delist.append(towns[q])
            for q in range(len(delist)):
                towns.remove(delist[q])
            delist = []
            
        
        if(towns[i]["population"] > towns[i]["devLevel"]):
            genBranchTown(towns[i])
            towns[i]["population"] = towns[i]["population"] / 2




for year in range(1,500):
    genTownForYear()
    townIterate()
    year = year + 1
print(send)