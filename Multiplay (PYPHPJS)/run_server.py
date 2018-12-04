import mysql.connector
database = mysql.connector.connect(host="localhost",user="root",passwd="root",database="twwb")
cursor = database.cursor()
sql = "INSERT INTO users (userName,userIcon) values (%s,%s)"
val = ("pym","lol")
cursor.execute(sql,val)
database.commit()
