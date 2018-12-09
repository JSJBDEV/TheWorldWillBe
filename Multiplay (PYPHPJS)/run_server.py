import mysql.connector, pygen_server, time
global database, cursor
database = mysql.connector.connect(host="localhost",user="root",passwd="root",database="twwb")
cursor = database.cursor()
#pygen_server.serverYear(100)
pygen_server.restartServer()

def updateValue(townIn,modifiable,modifier):
    town = pygen_server.getTownById(townIn)
    town[modifiable]=modifier
    sql = "UPDATE towns SET "+modifiable+"=%s WHERE realName=%s"
    value = (town[modifiable],town["realName"])
    cursor.execute(sql,value)
    database.commit()
    pygen_server.commit()
    
def incrementValue(townIn,modifiable,modifier):
    town = pygen_server.getTownById(townIn)
    print(town[modifiable])
    town[modifiable]=town[modifiable]+int(modifier)
    print(town[modifiable])
    sql = "UPDATE towns SET "+modifiable+"=%s WHERE realName=%s"
    value = (town[modifiable],town["realName"])
    cursor.execute(sql,value)
    database.commit()
    pygen_server.commit()



#updateValue("dar ben mbarek","resources",999)

check = 1
print("server will now start...")
while True:
    print("current check: "+str(check))
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
        value = (str(check+featTime[0]),task[0])
        print("will finish at check: "+str(check+featTime[0]))
        cursor.execute(sql,value)
        database.commit()
        
    cursor.execute("SELECT * FROM tasks WHERE noted=1")
    oldTasks = cursor.fetchall()
    for task in oldTasks:
        print("checking other tasks")
        if(int(task[4]) == check):
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
            cursor.execute("UPDATE users SET userCooldown=0 WHERE userID=%s",(task[3],))
            database.commit()

    cursor.execute("SELECT * FROM tasks WHERE noted=2")
    learnTasks = cursor.fetchall()
    for task in learnTasks:
        print("found an unchecked learn task")
        sql = "SELECT featLearn FROM feats WHERE featID=%s"
        val = (task[1],)
        cursor.execute(sql,val)
        learnTime = cursor.fetchone()[0]
        sql = "UPDATE tasks SET noted='3',exCheck=%s WHERE taskID=%s"
        val = (str(check+learnTime),task[0])
        cursor.execute(sql,val)
        database.commit()

    cursor.execute("SELECT * FROM tasks WHERE noted=3")
    learntTasks = cursor.fetchall()
    for task in learntTasks:
        if(int(task[4]) == check):
            print("finishing a learn task")
            sql = "UPDATE users SET userFeats = concat(userFeats,'%s,') WHERE userID='%s'"
            value = (task[1],task[3])
            cursor.execute(sql,value)
            database.commit()
            sql = "DELETE FROM tasks WHERE taskID=%s"
            val = (task[0],)
            cursor.execute(sql,val)
            database.commit()
            cursor.execute("UPDATE users SET userCooldown=0 WHERE userID=%s",(task[3],))
            database.commit()
            
    check = check + 1
    
    time.sleep(10)
