import urllib.request, math, argparse, json
global year,towns,seed
year = 0
runLength = 1
towns = []
send = []

parser = argparse.ArgumentParser()
parser.add_argument("years",help = "runs program for X years")
parser.add_argument("--town",help = "returns a specific object from the generated year")
parser.add_argument("--full",help = "dumps the full dictionary of towns for the generated year", action="store_true")
parser.add_argument("--seed",help = "changes the seed for the simulation, default is 1")
args = parser.parse_args()
runLength = args.years

def baseGenerator(year): #pseudorandom number generation using the congruential algorithm, x+A*B%M
    if(args.seed):
        seed = int(args.seed)
    else:
        seed = 1
    A = 234233466321
    B = 785432575563
    M = 924314325657
    for v in range(year):
        seed = math.fmod((seed+A)*B,M)
    return seed


def fitRecursively(inp,lim): #makes numbers smaller numbers by minusing the number by other numbers.
    while inp >= lim:
        inp = inp - lim
    return inp

def getFile(filename):
    file = open("github/"+filename,"r",buffering=-1, encoding="mbcs")
    re = file.read()
    fi = re.split("\n")
    return fi



def genTownForYear(): #does an equivilent to creating a town object.
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
    

def genBranchTown(parent): #same as above but with some slight modifications, effectively inheriting from the MainTown Object.
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
    parent["resources"] = parent["resources"] + townObject["resources"]

def genColonyTown(parent): #again the same a "subclass" of town
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
    send.append("~"+townObject["realName"]+","+townObject["latitude"]+","+townObject["longitude"]+","+townObject["branchedFrom"]+","+townObject["partOf"])
    parent["resources"] = parent["resources"] + townObject["resources"]

def townIterate(): #processes each town per year to change stats, obviously this means as more years are generated the time gets exponentionally longer.
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
                towns.remove(town)

        
       # if town["population"] == 1 and year-town["foundedYear"]>5:
       #     send.append("#"+town["realName"])
       #     towns.remove(town)

    for t in towns:
        if "#"+t["partOf"] in send: 
            send.append("#"+town["realName"])
            towns.remove(t)
    
            
def haversine(lat1,long1,lat2,long2): #for calculating distances using lattitude and longitiude
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
            towns.remove(town)

for year in range(1,int(runLength)): #initial loop.
    genTownForYear()
    townIterate()
    year = year + 1
    send.append("$")
if args.town:
    trueName = args.town.replace("_"," ")
    for c in range(len(towns)):
        if towns[c]["realName"] == trueName:
            zeed = str(getTownByRealName(towns[c]["partOf"])["townseed"])
            flagArray = [fitRecursively(int(zeed[0:2]),11),fitRecursively(int(zeed[1:3]),7),fitRecursively(int(zeed[2:4]),7),fitRecursively(int(zeed[3:5]),7),fitRecursively(int(zeed[4:6]),11),fitRecursively(int(zeed[5:7]),7),fitRecursively(int(zeed[6:8]),17),fitRecursively(int(zeed[7:9]),7)]
            print("<img src='http://flag-designer.appspot.com/gwtflags/SvgFileService?d="+str(flagArray[0])+"&c1="+str(flagArray[1])+"&c2="+str(flagArray[2])+"&c3="+str(flagArray[3])+"&o="+str(flagArray[4])+"&c4="+str(flagArray[5])+"&s="+str(flagArray[6])+"&c5="+str(flagArray[7])+"' alt='svg' width='60' height='40'/>")
            print(json.dumps(towns[c]))
            break
elif args.full:
    print(json.dumps(towns))
else:
    print(json.dumps(send))
