#!/bin/bash

# Comprobar argumentos
if [ $# -ne 2 ]
  then
    echo "Uso incorrecto:"
    echo $0 "REPLICAS ID"
    exit 1
fi

# Interpretar argumentos
ARG_REPLICAS=$1
ARG_ID=$2

sed -e "s/shardX/shard${ARG_ID}/g; s/ShardX/Shard${ARG_ID}/g; s/REPLICAS/${ARG_REPLICAS}/g" ./patterns/mongo-shard.yml
exit 0
