#!/bin/bash

# Mostrar mensaje informativo
echo ""
echo "=== Despliegue Front ==="
echo ""

cd patterns
echo "Comenzando despliegue de Front"

# Generar servicios
echo "Generando servicios..."

# Crear servicios
kubectl create -f front-service-external.yml
kubectl create -f front-statefulset.yml

echo "Front desplegado correctamente!"
