NET=ragrug

#mkdir -p $(pwd)/../../mnt/mqtt/config
#rm $(pwd)/../../mnt/mqtt/config/mosquitto.conf
#cp mosquitto.conf $(pwd)/../../mnt/mqtt/config

docker stop $NET-influxdb
docker rm $NET-influxdb
docker run \
  --restart=always \
  --net=$NET \
  -e INFLUXDB_REPORTING_DISABLED=true \
  -e INFLUXDB_DATA_QUERY_LOG_ENABLED=false \
  --log-driver none \
  -p 8086:8086 \
  -p 8083:8083 \
  -tid \
  -v $(pwd)/../../mnt/influxdb:/var/lib/influxdb \
  --name $NET-influxdb \
  influxdb:1.7
  #influxdb/influxdb


# check here for version info
# https://hub.docker.com/_/influxdb

#websocket port
#-p 9001:9001 \
