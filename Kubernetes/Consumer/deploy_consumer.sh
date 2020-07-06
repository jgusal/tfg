#!/bin/bash

# Comprobar argumentos
if [ $# -ne 4 ]; then
    echo "Uso incorrecto:"
    echo $0 "REPLICAS CONSUMER_USERNAME CONSUMER_PASSWORD CONSUMER_TOPIC"
    exit 1
fi

ARG_REPLICAS=$1
ARG_USERNAME=$2
ARG_PASSWORD=$3
ARG_TOPIC=$4

sed -e "s/REPLICAS/$ARG_REPLICAS/g; s/CONSUMER_USERNAME_VALUE/$ARG_USERNAME/g; s/CONSUMER_PASSWORD_VALUE/$ARG_PASSWORD/g; s/CONSUMER_TOPIC_VALUE/$ARG_TOPIC/g;" ./consumer-deployment.yml | kubectl create -f -

echo "Consumer deployed"
