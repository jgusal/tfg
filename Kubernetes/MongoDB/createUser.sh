#!/bin/bash

# Comprobar argumentos
if [ $# -ne 4 ]; then
    echo "Uso incorrecto:"
    echo $0 "ADMIN_USERNAME ADMIN_PASSWORD USERNAME PASSWORD"
    exit 1
fi

ADMIN_USERNAME=$1
ADMIN_PASSWORD=$2
USERNAME=$3
PASSWORD=$4
kubectl exec -it mongos-router-0 -c mongos-container -- mongo -u $ADMIN_USERNAME -p $ADMIN_PASSWORD --authenticationDatabase admin --eval "db.getSiblingDB(\"admin\").createUser({user:\"${USERNAME}\",pwd:\"${PASSWORD}\",roles: [{ role:\"root\",db: \"admin\"}]});"
