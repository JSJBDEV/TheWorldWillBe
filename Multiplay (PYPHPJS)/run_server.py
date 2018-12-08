import mysql.connector, pygen_server, time
global database, cursor
database = mysql.connector.connect(host="localhost",user="root",passwd="root",database="twwb")
cursor = database.cursor()
#pygen_server.serverYear(100)
pygen_server.restartServer()

def updateValue(townIn,modifiable,modifier):
    town = pygen_server.getTownByRealName(townIn)
    town[modifiable]=modifier
    sql = "UPDATE towns SET "+modifiable+"=%s WHERE realName=%s"
    value = (modifier,town["realName"])
    cursor.execute(sql,value)
    database.commit()
    
def incrementValue(townIn,modifiable,modifier):
    town = pygen_server.getTownByRealName(townIn)
    town[modifiable]=town[modifiable]+int(modifier)
    sql = "UPDATE towns SET "+modifiable+"=%s WHERE realName=%s"
    value = (modifier,town["realName"])
    cursor.execute(sql,value)
    database.commit()



#updateValue("dar ben mbarek","resources",999)

check = 1
print("server will now start...")
while True:
    database = mysql.connector.connect(host="localhost",user="root",passwd="root",database="twwb")
    cursor = database.cursor()
    cursor.execute("SELECT * FROM tasks WHERE noted=0")
    newTasks = cursor.fetchall()
    print(newTasks)
    for task in newTasks:
        print("found unchecked task")
        sql = "SELECT featTime FROM feats WHERE featID=%s"
        value = (task[1],)
        cursor.execute(sql,value)
        featTime = cursor.fetchone()
        sql = "UPDATE tasks SET noted='1', exCheck=%s WHERE taskID=%s"
        value = (str(featTime[0]),task[0])
        cursor.execute(sql,value)
        database.commit()
        
    cursor.execute("SELECT * FROM tasks WHERE noted=1")
    oldTasks = cursor.fetchall()
    for task in oldTasks:
        print("checking other tasks")
        if(int(task[3]) == check):
            print("finishing a task")
            sql = "SELECT featModifier FROM feats WHERE featID=%s"
            val = (task[1],)
            cursor.execute(sql,val)
            effect = cursor.fetchone()[0]
            feat = effect.split(",")
            incrementValue(task[2],feat[0],feat[1])
            sql = "DELETE FROM tasks WHERE taskID=%s"
            val = (task[0],)
            cursor.execute(sql,val)
            database.commit()
            
    check = check + 1
    
    time.sleep(10)
