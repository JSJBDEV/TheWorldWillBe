import urllib.request, math, json, mysql.connector
global year,towns,seed,database,cursor
year = 0
runLength = 1
towns = []
send = []
server = []
database = mysql.connector.connect(host="localhost",user="root",passwd="root",database="twwb")
cursor = database.cursor()

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
        
        sql = "INSERT INTO towns (realName,realCountry,realRegion,foundedYear,latitude,longitude,townseed,happiness,devLevel,culture,military,population,foodMod,resources,branchedFrom,partOf) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        val = (townObject["realName"],townObject["realCountry"],townObject["realRegion"],townObject["foundedYear"],townObject["latitude"],townObject["longitude"],townObject["townseed"],townObject["happiness"],townObject["devLevel"],townObject["culture"],townObject["military"],townObject["population"],townObject["foodMod"],townObject["resources"],townObject["branchedFrom"],townObject["partOf"])
        cursor.execute(sql,val)
        database.commit()
        cursor.execute("SELECT townID from towns ORDER BY townID DESC LIMIT 1")
        towns[len(towns)-1]["townId"] = cursor.fetchone()[0]
    

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
    sql = "INSERT INTO towns (realName,realCountry,realRegion,foundedYear,latitude,longitude,townseed,happiness,devLevel,culture,military,population,foodMod,resources,branchedFrom,partOf) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
    val = (townObject["realName"],townObject["realCountry"],townObject["realRegion"],townObject["foundedYear"],townObject["latitude"],townObject["longitude"],townObject["townseed"],townObject["happiness"],townObject["devLevel"],townObject["culture"],townObject["military"],townObject["population"],townObject["foodMod"],townObject["resources"],townObject["branchedFrom"],townObject["partOf"])
    cursor.execute(sql,val)
    database.commit()
    cursor.execute("SELECT townID from towns ORDER BY townID DESC LIMIT 1")
    towns[len(towns)-1]["townId"] = cursor.fetchone()[0]
    
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
    sql = "INSERT INTO towns (realName,realCountry,realRegion,foundedYear,latitude,longitude,townseed,happiness,devLevel,culture,military,population,foodMod,resources,branchedFrom,partOf) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
    val = (townObject["realName"],townObject["realCountry"],townObject["realRegion"],townObject["foundedYear"],townObject["latitude"],townObject["longitude"],townObject["townseed"],townObject["happiness"],townObject["devLevel"],townObject["culture"],townObject["military"],townObject["population"],townObject["foodMod"],townObject["resources"],townObject["branchedFrom"],townObject["partOf"])
    cursor.execute(sql,val)
    database.commit()
    cursor.execute("SELECT townID from towns ORDER BY townID DESC LIMIT 1")
    towns[len(towns)-1]["townId"] = cursor.fetchone()[0]
    
    

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

        sql = "UPDATE towns SET realName=%s,realCountry=%s,realRegion=%s,foundedYear=%s,latitude=%s,longitude=%s,townseed=%s,happiness=%s,devLevel=%s,culture=%s,military=%s,population=%s,foodMod=%s,resources=%s,branchedFrom=%s,partOf=%s WHERE realName=%s AND realRegion=%s"
        val = (town["realName"],town["realCountry"],town["realRegion"],town["foundedYear"],town["latitude"],town["longitude"],town["townseed"],town["happiness"],town["devLevel"],town["culture"],town["military"],town["population"],town["foodMod"],town["resources"],town["branchedFrom"],town["partOf"],town["realName"],town["realRegion"])
        cursor.execute(sql,val)
        database.commit()

        
        if town["resources"]<0:
            if parentTown == town:
                removeTownsInNation(town)
            else:
                parentTown["resources"] = parentTown["resources"]-10
                send.append("#"+town["realName"])
                
                server.append(town["realName"])
                server.append("#")
                sql = "DELETE FROM towns WHERE realName = %s"
                val = (town["realName"],)
                cursor.execute(sql,val)
                database.commit()
                towns.remove(town)
                
            
        
       # if town["population"] == 1 and year-town["foundedYear"]>5:
       #     send.append("#"+town["realName"])
       #     towns.remove(town)

    for t in towns:
        if "#"+t["partOf"] in send: 
            send.append("#"+town["realName"])
            
            server.append(town["realName"])
            server.append("#")
            sql = "DELETE FROM towns WHERE townID = %s"
            val = (t["townId"],)
            cursor.execute(sql,val)
            database.commit()
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
        if town["realName"] == name:
            return town
        
def getTownById(IDin):
    for town in towns:
        if town["townId"] == IDin:
            return town

def removeTownsInNation(townIn):
    for town in towns:
        if town["partOf"] == townIn["realName"]:
            send.append("#"+town["realName"])
            
            server.append(town["realName"])
            server.append("#")
            server.append("#")
            sql = "DELETE FROM towns WHERE townID = %s"
            val = (town["townId"],)
            cursor.execute(sql,val)
            database.commit()
            towns.remove(town)




def serverYear(yearz):
    global year, send, server
    for year in range(1,int(yearz)):
        genTownForYear()
        townIterate()
        year = year + 1
        send.append("$")
    commit()
    return towns


def nextYear():
    global year,send, server
    genTownForYear()
    townIterate()
    yearfile = open("dumps/year_dump.txt","r+")
    year = int(yearfile.read())
    year = year + 1
    send.append("$")
    commit()
    return towns

def restartServer():
    global year, towns
    yearfile = open("dumps/year_dump.txt","r+")
    year = int(yearfile.read())
    townfile = open("dumps/town_dump.txt","r+")
    towns = json.loads(townfile.read())

def commit():
    townfile = open("dumps/town_dump.txt","w+")
    townfile.write(json.dumps(towns))
    townfile.close()
    yearfile = open("dumps/year_dump.txt","w+")
    yearfile.write(str(year))
    yearfile.close()
