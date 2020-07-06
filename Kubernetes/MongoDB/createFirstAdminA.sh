USERNAME=$1
PASSWORD=$2
kubectl exec -it mongos-router-0 -c mongos-container -- mongo --eval "db.getSiblingDB(\"admin\").createUser({user:\"${USERNAME}\",pwd:\"${PASSWORD}\",roles: [{ role:\"root\",db: \"admin\"}]});"

