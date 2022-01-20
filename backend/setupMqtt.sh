docker stop ragrug-mqtt

rm -rf $(pwd)/../mnt/mqtt/config/mosquitto.conf
cp mqtt-server/mosquitto.conf $(pwd)/../mnt/mqtt/config/mosquitto.conf
docker start ragrug-mqtt
