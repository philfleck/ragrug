NET=ragrug

#mkdir -p $(pwd)/../../mnt/mqtt/config
#rm $(pwd)/../../mnt/mqtt/config/mosquitto.conf
#cp mosquitto.conf $(pwd)/../../mnt/mqtt/config
docker stop $NET-httpserver
docker rm $NET-httpserver
docker run \
  --restart=always \
  --net=$NET \
  --log-driver none \
  -p 9999:8080 \
  -tid \
  -v $(pwd)/../../HtmlUI:/public \
  --name $NET-httpserver \
  danjellz/http-server
  #influxdb/influxdb
