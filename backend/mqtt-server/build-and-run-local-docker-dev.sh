#NET=$PRJNAME-net
NET=ragrug
#NET=host

mkdir -p $(pwd)/../../mnt/mqtt/config
rm $(pwd)/../../mnt/mqtt/config/mosquitto.conf
cp mosquitto.conf $(pwd)/../../mnt/mqtt/config

docker stop $NET-mqtt
docker rm $NET-mqtt
docker run \
  --restart=always \
  --net=$NET \
  -p 1883:1883 \
  -p 9001:9001 \
  -tid \
  -v $(pwd)/../../mnt/mqtt/config:/mqtt/config:ro \
  -v $(pwd)/../../mnt/mqtt/log:/mqtt/log \
  -v $(pwd)/../../mnt/mqtt/data/:/mqtt/data/ \
  --name $NET-mqtt \
  toke/mosquitto

#websocket port
#-p 9001:9001 \
