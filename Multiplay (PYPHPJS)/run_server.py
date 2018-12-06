import mysql.connector, pygen_server
global database, cursor
database = mysql.connector.connect(host="localhost",user="root",passwd="root",database="twwb")
cursor = database.cursor()
pygen_server.serverYear(100)


def updateValue(town,modifiable,modifier):
    town[modifiable]=modifier
    sql = "UPDATE towns SET "+modifiable+"=%s WHERE realName=%s"
    value = (modifier,town["realName"])
    cursor.execute(sql,value)
    database.commit()
    


t = pygen_server.getTownByRealName("dar ben mbarek")
updateValue(t,"resources",999)



