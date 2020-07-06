from random import *
import json

dataset = []
from recommendator import Recommendator
r = Recommendator()

for i in range(16):
    x = {}
    x["day"] = randrange(1, 365)
    x["tmin"] = uniform(-5, 20)
    x["tmax"] = x["tmin"] + uniform(1, 20)
    x["tavg"] = uniform(x["tmin"], x["tmax"])
    x["lat"] = uniform(-1.57, 1.57)
    x["prec"] = uniform(0, 30)
    x["kc"] = uniform(0.5, 1.2)
    x["ef"] = uniform(0.45, 0.95)
    
    y = r.gbr(x["day"], x["tmin"], x["tmax"], x["tavg"], x["lat"], x["prec"], x["kc"], x["ef"])
    
    
    dataset.append({"x": x, "y": y[0]})

print(json.dumps(dataset))