set -e
docker build -t jorgeg/tfg:recommend .
docker push jorgeg/tfg:recommend
