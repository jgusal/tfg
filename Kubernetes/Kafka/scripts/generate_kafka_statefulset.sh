#!/bin/bash

# Comprobar argumentos
if [ $# -ne 3 ]
  then
    echo "Uso incorrecto:"
    echo $0 "REPLICAS CLUSTER_IP TOPICS"
    echo "Donde TOPICS tiene el formato NAME:PARTITIONS:REPLICATION;NAME:PARTITIONS:REPLICATION;...;NAME:PARTITIONS:REPLICATION"
    exit 1
fi

# Interpretar argumentos
ARG_REPLICAS=$1
ARG_IP=$2
ARG_TOPICS=$3

sed -e "s/REPLICAS/$ARG_REPLICAS/g; s/EXTERNAL_IP_VALUE/$ARG_IP/g; s/TOPICS_VALUE/$ARG_TOPICS/g" ./patterns/kafka-statefulset-pattern.yml

