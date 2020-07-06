#!/bin/env bash

## CONFIGURACION
# Zookeeper
ZOOKEEPER_REPLICAS=3
ZOOKEEPER_STORAGE=3
# Kafka
KAFKA_REPLICAS=2
KAFKA_IP=192.168.1.79
KAFKA_TOPICS="sensores:1:2"
# MongoDB
SHARDS=3
SHARD_REPLICAS=3
CONFIG_REPLICAS=2
ROUTING_REPLICAS=1
STORAGE_SHARD_SIZE=5
STORAGE_CONFIG_SIZE=2
MONGO_USER="test_admin"
MONGO_PASS="1234"
# Consumidor
CONSUMER_REPLICAS=1
CONSUMER_USER="test_admin"
CONSUMER_PASS="1234"
CONSUMER_TOPIC="sensores"

# Zookeeper
cd Zookeeper
./deploy_zookeeper.sh $ZOOKEEPER_REPLICAS $ZOOKEEPER_STORAGE -a

# Kafka
cd ../Kafka
./deploy_kafka.sh $KAFKA_REPLICAS $KAFKA_IP $KAFKA_TOPICS -a

# MongoDB
cd ../MongoDB
./deploy_mongo.sh $SHARDS $SHARD_REPLICAS $CONFIG_REPLICAS $ROUTING_REPLICAS $STORAGE_SHARD_SIZE $STORAGE_CONFIG_SIZE -a
./createFirstAdminA.sh $MONGO_USER $MONGO_PASS

# Consumidor
cd ../Consumidor
./deploy_consumer.sh $CONSUMER_REPLICAS $CONSUMER_USER $CONSUMER_PASS $CONSUMER_TOPIC

# Recomendador
cd ../Recommender
./deploy_recommender.sh

# Dashboard
cd ../FrontEnd
./deploy_front.sh

echo "TFG Desplegado!"
