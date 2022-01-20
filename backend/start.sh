echo "setup folderstructure"
mkdir -p $(pwd)/../mnt/uploads
mkdir -p $(pwd)/../mnt/outputs

echo "starting influxdb ..."
cd influxdb
./build-and-run-local-docker-dev.sh
cd ..

#echo "starting postgres ..."
#cd postgres
#./build-and-run-local-docker-dev.sh
#cd ..

echo "starting couchdb ..."
cd couchdb
./build-and-run-local-docker-dev.sh
cd ..

echo "starting mqtt broker..."
cd mqtt-server
./build-and-run-local-docker-dev.sh
cd ..

echo "starting grafana ..."
cd grafana
./build-and-run-local-docker-dev.sh
cd ..

echo "starting node-red ..."
cd node-red
./build-and-run-local-docker-dev.sh
cd ..

echo "starting UI http-server"
cd httpserver
./build-and-run-local-docker-dev.sh
cd ..
