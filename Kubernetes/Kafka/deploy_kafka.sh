#!/bin/bash

# Comprobar argumentos
if [ $# -ne 3 ] && [ "$4" != "-a" ]; then
    echo "Uso incorrecto:"
    echo $0 "REPLICAS CLUSTER_IP TOPICS [-a]"
    echo "Donde TOPICS tiene el formato NAME:PARTITIONS:REPLICATION;NAME:PARTITIONS:REPLICATION;...;NAME:PARTITIONS:REPLICATION"
    exit 1
fi

# Interpretar argumentos
ARG_REPLICAS=$1
ARG_IP=$2
ARG_TOPICS=$3

# Mostrar mensaje informativo
echo ""
echo "=== Despliegue Kafka ==="
echo "Replicas : ${ARG_REPLICAS} nodos"
echo "========================"
echo ""

# Solicitar confirmacion
if [ "$4" != "-a" ]; then
	echo "Confirmar despliegue? (s/n): "
	read confirmacion
	
	if [ "$confirmacion" != "s" ]; then
    	echo "Despliegue cancelado"
    	exit
	fi
fi

cd scripts
echo "Comenzando despliegue de Kafka"

# Generar servicios
echo "Generando servicios..."
./generate-kafka-service-external.sh $ARG_REPLICAS | kubectl create -f -
kubectl create -f patterns/kafka-service-internal.yml

# Desplegar set
echo "Desplegando set..."
./generate_kafka_statefulset.sh $ARG_REPLICAS $ARG_IP $ARG_TOPICS | kubectl create -f -

# Comprobando disponibilidad
for i in $(seq 0 $((ARG_REPLICAS-1)));
do
	kubectl exec kafka-$i -- /kafka/bin/kafka-broker-api-versions.sh --bootstrap-server kafka:9092
	while [[ $? != 0 ]] ; do
		sleep 5
    	kubectl exec kafka-$i -- /kafka/bin/kafka-broker-api-versions.sh --bootstrap-server kafka:9092
	done
done

echo "Kafka desplegado correctamente!"
