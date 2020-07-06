import flask
from flask import Flask, request, jsonify
import json
from pymongo import MongoClient
from recommendator import Recommendator
import os
from datetime import datetime
from bson.objectid import ObjectId
import math
import time
from datetime import timedelta

# Conexion con MongoDB
MONGO_URL = 'mongodb://test_admin:1234@192.168.1.79:31500/tfg?authSource=admin'
client = MongoClient(MONGO_URL)
db = client.tfg
# Inicialización del recomendador
recommendator = Recommendator()
# Nombre de la aplicacion Flask
app = flask.Flask(__name__)

# Endpoint de recomendacion
@app.route('/recommendate', methods=['GET'])
def daily_data():
    try:
        # Obtener id del terreno de la peticion
        terrain_id = ObjectId(request.args["terrain_id"])
        # Calcular periodo de tiempo a tener en cuenta
        from_time = time.time() - timedelta(days=1).total_seconds()
        # Obtencion del dia
        day = datetime.now().timetuple().tm_yday
        # Obtencion de los datos del terreno
        terrain = db.terrains.find_one({"_id": terrain_id})
        latitude = math.radians(terrain["lat"])
        Kc = terrain["cropfactor"]
        Ef = terrain["waterfactor"]
        temperature = list(db.sensores.aggregate([
            {"$match": {"terrain_id": terrain_id, "sensor_type": "temperature", "timestamp": {"$gt": from_time}}},
            {"$group": {"_id": None, "max": {"$max": "$value"},
            "min": {"$min": "$value"}, "avg": {"$avg": "$value"}}}]))[0]
        tmax = temperature["max"]
        tmin = temperature["min"]
        tmean = temperature["avg"]
        precipitation = list(db.sensores.aggregate([
            {"$match": {"terrain_id": terrain_id, "sensor_type": "precipitation", "timestamp": {"$gt": from_time}}},
            {"$group": {"_id": None, "avg": {"$avg": "$value"}}}]))[0]
        precipitationavg = precipitation["avg"]
        
        return jsonify(recommendator(day, tmax, tmin, tmean, latitude, precipitationavg, Kc, Ef))
    except:
        flask.abort(422)

app.run(host = "0.0.0.0", port = 5000)
