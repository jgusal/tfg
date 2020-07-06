#!/bin/bash

# Comprobar argumentos
if [ $# -ne 1 ]
  then
    echo "Uso incorrecto:"
    echo $0 "REPLICAS"
    exit 1
fi

# Interpretar argumentos
ARG_REPLICAS=$1

sed -e "s/REPLICAS/${ARG_REPLICAS}/g" ./patterns/mongo-config.yml
exit 0
