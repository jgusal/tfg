#!/bin/bash

# Comprobar argumentos
if [ $# -ne 1 ]
  then
    echo "Uso incorrecto:"
    echo $0 "REPLICAS"
    exit 1
fi

cd patterns
let REPLICAS=$1-1
if [ -z "$2" ]
then
	BASE_PORT=31000
else
	BASE_PORT=$2
fi
CONFIG_TEXT=`cat kafka-service-external-pattern.yml`

for GENERATED_ID in $(seq 0 $REPLICAS)
do
	let GENERATED_PORT=$BASE_PORT+GENERATED_ID
	tmpvar="${CONFIG_TEXT//GENERATED_ID/$GENERATED_ID}"
	echo "${tmpvar//GENERATED_PORT/$GENERATED_PORT}"
	
	if [ $GENERATED_ID -ne $REPLICAS ]
	then
		echo "---"
	fi
done

