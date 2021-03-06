#!/bin/bash

# Comprobar argumentos
if [ $# -ne 6 ] && [ "$7" != "-a" ]; then
    echo "Uso incorrecto:"
    echo $0 "SHARDS SHARD_REPLICAS CONFIG_REPLICAS ROUTING_REPLICAS STORAGE_SHARD_SIZE STORAGE_CONFIG_SIZE [-a]"
    exit 1
fi

# Interpretar argumentos
ARG_SHARDS=$1
ARG_SHARD_REPLICAS=$2
ARG_CONFIG_REPLICAS=$3
ARG_ROUTING_REPLICAS=$4
ARG_STORAGE_SHARD_SIZE=$5
ARG_STORAGE_CONFIG_SIZE=$6

# Mostrar mensaje informativo
echo ""
echo "=== Despliegue MongoDB ==="
echo "Shards : ${ARG_SHARDS} shards, ${ARG_SHARD_REPLICAS}, total $(( $ARG_SHARDS * $ARG_SHARD_REPLICAS )) nodos shard"
echo "Config : ${ARG_CONFIG_REPLICAS} replicas"
echo "Routing: ${ARG_ROUTING_REPLICAS} replicas"
echo ""
echo "Total: $(( $ARG_SHARDS * $ARG_SHARD_REPLICAS + $ARG_CONFIG_REPLICAS + $ARG_ROUTING_REPLICAS )) nodos"
echo "---"
echo "Almacenamiento shard : ${ARG_STORAGE_SHARD_SIZE} Gi (total $(( ARG_STORAGE_SHARD_SIZE * ARG_SHARDS * ARG_SHARD_REPLICAS )) Gi)"
echo "Almacenamiento config: ${ARG_STORAGE_CONFIG_SIZE} Gi (total $(( ARG_STORAGE_CONFIG_SIZE * ARG_CONFIG_REPLICAS )) Gi)"
echo ""
echo "Total: $(( ARG_STORAGE_SHARD_SIZE * ARG_SHARDS * ARG_SHARD_REPLICAS + ARG_STORAGE_CONFIG_SIZE * ARG_CONFIG_REPLICAS )) Gi"
echo "=========================="
echo ""

# Solicitar confirmacion
if [ "$7" != "-a" ]; then
	echo "Confirmar despliegue? (s/n): "
	read confirmacion

	if [ "$confirmacion" != "s" ]; then
    	echo "Despliegue cancelado"
    	exit
	fi
fi

cd scripts
echo "Comenzando despliegue de MongoDB"

# Configurar clases de almacenamiento
echo "Configurando clases de almacenamiento..."
kubectl create -f ./storage_options/shard-storage.yml
kubectl create -f ./storage_options/config-storage.yml

# Generar volumenes shard
let VOLUME_COUNT=$ARG_SHARDS*$ARG_SHARD_REPLICAS
echo "Generando ${VOLUME_COUNT} shard-volumenes..."
for i in $(seq 0 $((VOLUME_COUNT-1)));
do
    ./generate_shard_storage.sh $ARG_STORAGE_SHARD_SIZE $i | kubectl create -f -
done

# Generar volumenes config
let VOLUME_COUNT=$ARG_CONFIG_REPLICAS
echo "Generando ${VOLUME_COUNT} config-volumenes..."
for i in $(seq 0 $((VOLUME_COUNT-1)));
do
    ./generate_config_storage.sh $ARG_STORAGE_CONFIG_SIZE $i | kubectl create -f -
done

# Generar secreto
echo "Generando secreto..."
./generate_secret.sh

# Generar servicios de configuracionn
echo "Generando servicios de configuracion..."
kubectl create -f ./service/mongo-config-service.yml
./generate_config.sh $ARG_CONFIG_REPLICAS | kubectl create -f -

# Generar shards
echo "Generando shards..."
for i in $(seq 0 $((ARG_SHARDS-1)));
do
    ./generate_shard.sh $ARG_SHARD_REPLICAS $i | kubectl create -f -
done

# Generar enrutadores
echo "Generando enrutadores..."
kubectl create -f ./service/mongo-routing-service.yml
./generate_routing.sh $ARG_ROUTING_REPLICAS $ARG_CONFIG_REPLICAS | kubectl create -f -

# Esperar al despliegue de los shards y de la configuracion
echo "Esperando a que esten listos el servicio de configuracion y los shards..."
until kubectl --v=0 exec mongod-configdb-$((ARG_CONFIG_REPLICAS-1)) -c mongod-configdb-container -- mongo --quiet --eval 'db.getMongo()' &> /dev/null; do
    sleep 5
done
echo "configdb READY"
for i in $(seq 0 $((ARG_SHARDS-1)));
do
    until kubectl --v=0 exec mongod-shard${i}-$((ARG_SHARD_REPLICAS-1)) -c mongod-shard${i}-container -- mongo --quiet --eval 'db.getMongo()' &> /dev/null; do
    	sleep 5
	done
	echo "shard-${i} READY"
done

# Inicializar servidor de configuracion y sets de shards
echo "Inicializando servidor de configuracion y sets de shards..."
for i in $(seq 0 $((ARG_CONFIG_REPLICAS-1)));
do
    MEMBERS="${MEMBERS}, {_id: ${i}, host: \"mongod-configdb-${i}.mongodb-configdb-service.default.svc.cluster.local:27017\"}"
done
MEMBERS=${MEMBERS:2}

kubectl exec mongod-configdb-0 -c mongod-configdb-container -- mongo --eval "while (rs.initiate({_id: \"ConfigDBRepSet\", version: 1, members: [ ${MEMBERS} ]}).ok != 1) { sleep(1000); };"
echo "configdb READY"

for i in $(seq 0 $((ARG_SHARDS-1)));
do
	MEMBERS=
    for j in $(seq 0 $((ARG_SHARD_REPLICAS-1)));
	do
    	MEMBERS="${MEMBERS}, {_id: ${j}, host: \"mongod-shard${i}-${j}.mongodb-shard${i}-service.default.svc.cluster.local:27017\"}"
	done
	MEMBERS=${MEMBERS:2}
	kubectl exec mongod-shard${i}-0 -c mongod-shard${i}-container -- mongo --eval "while (rs.initiate({_id: \"Shard${i}RepSet\", version: 1, members: [ $MEMBERS ]}).ok != 1) { sleep(1000); };"
	echo "mongod-${i} READY"
done

# Esperar inicializacion de los sets de replicas
echo "Esperando a que se inicialicen los sets de replicas..."
kubectl exec mongod-configdb-0 -c mongod-configdb-container -- mongo --quiet --eval 'while (rs.status().hasOwnProperty("myState") && rs.status().ok != 1) { sleep(1000); };'
echo "configdb READY"
for i in $(seq 0 $((ARG_SHARDS-1)));
do
    kubectl exec mongod-shard${i}-0 -c mongod-shard${i}-container -- mongo --quiet --eval 'while (rs.status().hasOwnProperty("myState") && rs.status().ok != 1) { sleep(1000); };'
    echo "shard-${i} READY"
done

# Esperar a que los mongos esten disponibles
echo "Esperando a que finalice el proceso de inicializacion..."
until kubectl --v=0 exec mongos-router-0 -c mongos-container -- mongo --quiet --eval 'db.getMongo()' &> /dev/null; do
    sleep 2
done

# Añadir los shards a los servidores de configuracion
echo "Añadiendo los shards a los servidores de configuracion..."
for i in $(seq 0 $((ARG_SHARDS-1)));
do
    kubectl exec mongos-router-0 -c mongos-container -- mongo --eval "while (sh.addShard(\"Shard${i}RepSet/mongod-shard${i}-0.mongodb-shard${i}-service.default.svc.cluster.local:27017\").ok != 1) { sleep(1000); };"
    echo "shard-${i} READY"
done

echo ""
echo "Despliegue completado!"
echo ""

# Solicitar confirmacion crear usuario
if [ "$7" != "-a" ]; then
	echo "Desea crear un usuario administrador? (s/n): "
	read confirmacion

	if [ "$confirmacion" != "s" ]; then
    	echo "No se creara el usuario"
    	exit
	fi

	echo "Introduzca nombre del usuario"
	read username
	echo "Por favor espere..."
	kubectl exec -it mongos-router-0 -c mongos-container -- mongo --eval "db.getSiblingDB(\"admin\").createUser({user:\"${username}\",pwd:passwordPrompt(),roles: [{ role:\"root\",db: \"admin\"}]});"
fi
