import urllib.request, math, json
global year,towns,seed
year = 0
runLength = 1
towns = []
send = []
server = []



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
                "realName":"="+tsplit[1].replace("'","`"),
                "realCountry":tsplit[0],
                "foundedYear":year,
                "realRegion":tsplit[3],
                "latitude":tsplit[5],
                "longitude":tsplit[6],
                "townseed":baseGenerator(222+len(towns)),
                "happiness":100,
                "devLevel":100,
                "culture":0,
                "military":1,
                "population":1,
                "foodMod":5,
                "resources":int(str(baseGenerator(222+len(towns)))[4:6]),
                "branchedFrom":"NA",
                "partOf":"="+tsplit[1].replace("'","`")
            }
        #print(townObject)
        towns.append(townObject)
        
        send.append(townObject["realName"]+","+townObject["latitude"]+","+townObject["longitude"])
        
        server.append(townObject)
        server.append(">")
    

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
            "culture":0,
            "military":1,
            "population":1,
            "foodMod":5,
            "resources":int(str(baseGenerator(222+len(towns)))[4:6]),
            "branchedFrom":parent["realName"],
            "partOf":parent["partOf"]
        }
    #print(townObject)
    towns.append(townObject)
    
    send.append("~"+townObject["realName"]+","+townObject["latitude"]+","+townObject["longitude"]+","+townObject["branchedFrom"]+","+townObject["partOf"])
    server.append("~")
    
    server.append(townObject)
    parent["resources"] = parent["resources"] + townObject["resources"]

def genColonyTown(parent):
    seed = baseGenerator(year)
    test = getFile("compare.txt")
    close = []
    for line in test:
        onLine = line.split(",")
        if haversine(float(onLine[5]),float(onLine[6]),parent["latitude"],parent["longitude"]) < 200*parent["devLevel"]:
            close.append(onLine)

    regionPicked = close[fitRecursively(int(str(seed*3)[2:4]),len(close))]
        
    file = getFile("countries/"+regionPicked[0]+".txt")
    region = []
    for i in range(len(file)-1):
        if file[i].split(",")[3] == regionPicked[3]:
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
            "culture":0,
            "military":1,
            "population":1,
            "foodMod":5,
            "resources":int(str(baseGenerator(222+len(towns)))[4:6]),
            "branchedFrom":parent["realName"],
            "partOf":parent["partOf"]
        }
    #print(townObject)
    towns.append(townObject)
    server.append("~")
    send.append("~"+townObject["realName"]+","+townObject["latitude"]+","+townObject["longitude"]+","+townObject["branchedFrom"]+","+townObject["partOf"])
    
    server.append(townObject)
    parent["resources"] = parent["resources"] + townObject["resources"]

def townIterate():
    for town in towns:
        #print(town)
        try:
            ratioseed = math.fmod(town["townseed"],baseGenerator(year))
            town["foodMod"] = int(str(ratioseed)[1:2])+1
        except:
            continue
        parentTown = town
        if town["branchedFrom"] != "NA":
            for v in towns:
                if v["realName"] == town["branchedFrom"]:
                    parentTown = v
                    break
        else:
            parentTown = town
            
        if town["foodMod"] == 2 or town["foodMod"] == 3:
            town["resources"] = town["resources"]-1
        if town["foodMod"] == 8 or town["foodMod"] == 9:
            town["resources"] = town["resources"]+1
        if town["foodMod"] == 1:
            parentTown["resources"] = parentTown["resources"]-1
            town["resources"] = town["resources"]-1
        if town["foodMod"] == 10:
            parentTown["resources"] = parentTown["resources"]+1
            town["resources"] = town["resources"]+1
            
        town["population"] = town["population"] + math.floor((int(str(town["townseed"])[1])*(year-town["foundedYear"]+1))/2)
        town["devLevel"] = town["devLevel"] + int(str(baseGenerator(year))[2:4]) + math.floor(0.1*int(str(town["townseed"])[1:3]))

        if int(str(ratioseed)[3:5]) >=50:
            town["happiness"] = town["happiness"] + 1
        else:
            town["happiness"] = town["happiness"] - 1
            
        if town["devLevel"]< parentTown["devLevel"]:
            parentTown["resources"] = parentTown["resources"] - 1
       
        if(town["population"] > town["devLevel"]):
            town["population"] = town["population"] / 2
            if(town["devLevel"]>5000):
                genColonyTown(town)
            else:
                genBranchTown(town)
        
			
        if(int(str(ratioseed)[5:7])<30*(1-town["culture"])): #this is a battle event.
            for f in towns:
                if haversine(town["latitude"],town["longitude"],f["latitude"],f["longitude"])<town["devLevel"]*500 and town["partOf"] != f["partOf"]:
                    if town["devLevel"]*town["military"]>f["population"]:
                        parentTown["resources"] = parentTown["resources"]-5
                        f["resources"] = f["resources"]-20
                        break;

        if town["resources"]<0:
            if parentTown == town:
                removeTownsInNation(town)
            else:
                parentTown["resources"] = parentTown["resources"]-10
                send.append("#"+town["realName"])
                
                server.append(town["realName"])
                server.append("#")
                towns.remove(town)

        
       # if town["population"] == 1 and year-town["foundedYear"]>5:
       #     send.append("#"+town["realName"])
       #     towns.remove(town)

    for t in towns:
        if "#"+t["partOf"] in send: 
            send.append("#"+town["realName"])
            
            server.append(town["realName"])
            server.append("#")
            towns.remove(t)
    
            
def haversine(lat1,long1,lat2,long2):
    R = 6371e3
    φ1 = math.radians(float(lat1))
    φ2 = math.radians(float(lat2))
    Δφ = math.radians(float(lat2)-float(lat1))
    Δλ = math.radians(float(long2)-float(long1))

    a = math.sin(Δφ/2) * math.sin(Δφ/2) + math.cos(φ1) * math.cos(φ2) * math.sin(Δλ/2) * math.sin(Δλ/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    d = R * c
    return d
def getTownByRealName(name):
    for town in towns:
        if town["realName"]:
            return town

def removeTownsInNation(townIn):
    for town in towns:
        if town["partOf"] == townIn["realName"]:
            send.append("#"+town["realName"])
            
            server.append(town["realName"])
            server.append("#")
            towns.remove(town)




def serverYear(yearz):
    global year, send, server
    for year in range(1,int(yearz)):
        genTownForYear()
        townIterate()
        year = year + 1
        send.append("$")
        server.append("$")

    final = []
    for town in range(len(server)):
        if(server[len(server)-2-town] != "$"):
            final.append(server[len(server)-2-town])
        else:
            break
    print(final)
