#!/bin/bash

# Comprobar argumentos
if [ $# -ne 2 ]
  then
    echo "Uso incorrecto:"
    echo $0 "REPLICAS CONFIG_REPLICAS"
    exit 1
fi

# Interpretar argumentos
ARG_REPLICAS=$1
ARG_CONFIG_REPLICAS=$2

CONFIGDB="ConfigDBRepSet\/"
for i in $(seq 0 $((ARG_CONFIG_REPLICAS-1)));
do
    CONFIGDB="${CONFIGDB}mongod-configdb-${i}.mongodb-configdb-service.default.svc.cluster.local:27017,"
done
CONFIGDB=${CONFIGDB::-1}

sed -e "s/REPLICAS/${ARG_REPLICAS}/g; s/CONFIGDB/${CONFIGDB}/g" ./patterns/mongo-routing.yml
exit 0
