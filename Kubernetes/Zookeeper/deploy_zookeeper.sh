#!/bin/bash

# Comprobar argumentos
if [ $# -ne 2 ] && [ "$3" != "-a" ]; then
    echo "Uso incorrecto:"
    echo $0 "REPLICAS STORAGE_SIZE [-a]"
    exit 1
fi

# Interpretar argumentos
ARG_REPLICAS=$1
ARG_STORAGE_SIZE=$2

# Mostrar mensaje informativo
echo ""
echo "=== Despliegue Zookeeper ==="
echo "Replicas : ${ARG_REPLICAS} nodos"
echo "---"
echo "Almacenamiento replica : ${ARG_STORAGE_SIZE} Gi"
echo ""
echo "Total: $(( ARG_STORAGE_SIZE * ARG_REPLICAS )) Gi"
echo "============================"
echo ""

# Solicitar confirmacion
if [ "$3" != "-a" ]; then
	echo "Confirmar despliegue? (s/n): "
	read confirmacion
	
	if [ "$confirmacion" != "s" ]; then
    	echo "Despliegue cancelado"
    	exit
	fi
fi

cd scripts
echo "Comenzando despliegue de Zookeeper"

# Configurar clases de almacenamiento
echo "Configurando clases de almacenamiento..."
kubectl create -f ./storage_options/zookeeper-storage.yml

# Generar volumenes shard
echo "Generando ${ARG_REPLICAS} volumenes..."
for i in $(seq 0 $((ARG_REPLICAS-1)));
do
    ./generate_storage.sh $ARG_STORAGE_SIZE $i | kubectl create -f -
done

# Generar servicios
echo "Generando servicios..."
kubectl create -f ./services/zookeeper-client.yml
kubectl create -f ./services/zookeeper-headless.yml

# Desplegar replicas
echo "Desplegando replicas..."
./generate_set.sh $ARG_REPLICAS | kubectl create -f -

# Esperar al despliegue
echo "Esperando a que se complete el despliegue..."
for i in $(seq 0 $((ARG_REPLICAS-1)));
do
	ANS=	
    until [ "$ANS" == "imok" ]; do
    	ANS=$( kubectl exec -it zookeeper-$i-0 -- bash -c "echo ruok | nc 127.0.0.1 2181" )
    	sleep 5
	done
	echo "replica-${i} READY"
done

# Comprobar conectividad
echo "Comprobando conectividad..."
until kubectl exec -it zookeeper-0-0 -- bash -c "./bin/zkCli.sh create /hello world"; do
	sleep 5
done

for i in $(seq 0 $((ARG_REPLICAS-1)));
do
	until kubectl exec -it zookeeper-${i}-0 -- bash -c "./bin/zkCli.sh get /hello"; do
    	sleep 5
	done
    echo "replica-${i} READY"
done

echo "Despliegue completado!"
