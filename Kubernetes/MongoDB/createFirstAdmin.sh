echo "Introduzca nombre del usuario"
read username
echo "Por favor espere..."
kubectl exec -it mongos-router-0 -c mongos-container -- mongo --eval "db.getSiblingDB(\"admin\").createUser({user:\"${username}\",pwd:passwordPrompt(),roles: [{ role:\"root\",db: \"admin\"}]});"
