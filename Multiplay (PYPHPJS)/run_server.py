import mysql.connector, pygen_server
database = mysql.connector.connect(host="localhost",user="root",passwd="root",database="twwb")


def addTown(town):
    cursor = database.cursor()
    sql = "INSERT INTO towns (realName,realCountry,realRegion,foundedYear,latitude,longitude,townseed,happiness,devLevel,culture,military,population,foodMod,resources,branchedFrom,partOf) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
    val = (town["realName"],town["realCountry"],town["realRegion"],town["foundedYear"],town["latitude"],town["longitude"],town["townseed"],town["happiness"],town["devLevel"],town["culture"],town["military"],town["population"],town["foodMod"],town["resources"],town["branchedFrom"],town["partOf"])
    cursor.execute(sql,val)
    database.commit()




yeartasks = pygen_server.serverYear(4)
while len(yeartasks) > 0:
    if yeartasks[0] == ">":
        yeartasks.pop(0)
        addTown(yeartasks[0])
        yeartasks.pop(0)
    if yeartasks[0] == "#":
