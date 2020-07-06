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

SERVER_LIST=
for i in $(seq 0 $((ARG_REPLICAS-1)));
do
	SERVER_LIST="${SERVER_LIST}server.$(( $i + 1 ))=zookeeper-$i-0.zookeeper-headless.default.svc.cluster.local:2888:3888;2181 "
done

for i in $(seq 0 $((ARG_REPLICAS-1)));
do
	sed -e "s/DYNAMIC_ID/$(( $i + 1 ))/g; s/DYNAMIC_INST/$i/g; s/DYNAMIC_SERVER_LIST/$SERVER_LIST/g" ./patterns/zookeeper-statefulset-pattern.yml
	echo "---"
done
exit 0
