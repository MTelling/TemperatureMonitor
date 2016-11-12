from pymongo import MongoClient
import datetime
import time


# Establish connection to db
client = MongoClient('192.168.0.101', 27017)
db = client['temperature_collection']

temperatures = db.temperatures
while (True):
    for post in temperatures.find().sort("_id", -1).limit(1):
    	str_time = str(post['date'])
    	print "Temperature:", str(post['temperature']), "At time:", str_time 
    time.sleep(30)

print "Exiting"


