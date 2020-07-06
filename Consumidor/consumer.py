#!/usr/bin/env python3
import json
from kafka import KafkaConsumer
from pymongo import MongoClient
import time
import os
from bson.objectid import ObjectId

# Get values from environment variables
consumer_username = os.environ['CONSUMER_USERNAME']
consumer_password = os.environ['CONSUMER_PASSWORD']
consumer_topic = os.environ['CONSUMER_TOPIC']

# Connect to Kafka and MongoDB
client = MongoClient('mongos-router-service', 27017, username=consumer_username, password=consumer_password, authSource="admin")
db = client.tfg
consumer = KafkaConsumer(
    consumer_topic,
    bootstrap_servers=['192.168.1.79:31000'],
    group_id='consumidor',
    consumer_timeout_ms=1000)
collection = db.sensores

# Main loop
while True:
    try:
        for message in consumer:
            try:
                # Print message
                print(message.value)
                # Parse JSON
                message_json = json.loads(message.value)
                # Write datetime if not present
                date_time = message_json.pop('date_time', None)
                timestamp = None
                if date_time:
                    t = time.strptime(date_time, "%Y-%m-%d %H:%M:%S")
                    timestamp = time.mktime(t)
                else:
                    timestamp = time.time()
                message_json['timestamp'] = timestamp
                message_json['datetime'] = date_time
                # Convert id to ObjectIds
                try:
                    message_json['terrain_id'] = ObjectId(message_json['terrain_id'])
                    message_json['sensor_id'] = ObjectId(message_json['sensor_id'])
                except:
                    pass
                # Insert into MongoDB
                collection.insert_one(message_json)
            except:
                print("Error")
    except:
        print("External except")
