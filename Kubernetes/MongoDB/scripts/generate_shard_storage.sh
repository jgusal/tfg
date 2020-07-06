#!/bin/bash

# Comprobar argumentos
if [ $# -ne 2 ]
  then
    echo "Uso incorrecto:"
    echo $0 "SIZE ID"
    exit 1
fi

# Interpretar argumentos
ARG_SIZE=$1
ARG_ID=$2

sed -e "s/INST/${ARG_ID}/g; s/SIZE/${ARG_SIZE}/g" ./patterns/mongo-shard-volume.yml
exit 0
