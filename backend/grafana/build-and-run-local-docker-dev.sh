NET=ragrug

#GF_PATHS_CONFIG	/etc/grafana/grafana.ini
#GF_PATHS_DATA	/var/lib/grafana
#GF_PATHS_HOME	/usr/share/grafana
#GF_PATHS_LOGS	/var/log/grafana
#GF_PATHS_PLUGINS	/var/lib/grafana/plugins
#GF_PATHS_PROVISIONING	/etc/grafana/provisioning

#mkdir -p $(pwd)/../../mnt/mqtt/config
#rm $(pwd)/../../mnt/mqtt/config/mosquitto.conf
#cp mosquitto.conf $(pwd)/../../mnt/mqtt/config

docker stop $NET-grafana
docker rm $NET-grafana
docker run \
  --restart=always \
  --net=$NET \
  -p 3000:3000 \
  -tid \
  -v $(pwd)/../../mnt/grafana/data:/var/lib/grafana \
  -v $(pwd)/../../mnt/grafana/log/:/var/log/grafana \
  -v $(pwd)/../../mnt/grafana/config:/etc/grafana \
  -e "GF_AUTH_ANONYMOUS_ENABLED=true" \
  -e "GF_RENDERING_SERVER_URL=http://ragrug-grafana-img:8081/render" \
  -e "GF_RENDERING_CALLBACK_URL=http://ragrug-grafana:3000" \
  --name $NET-grafana \
  grafana/grafana:7.3.6
  

  # --entrypoint bash
  #-v $(pwd)/../../mnt/grafana/config:/etc/grafana \
  #-e "GF_PATHS_CONFIG=/grafana/config" \
  #-e "GF_PATHS_DATA=/grafana/data" \
  #-e "GF_PATHS_LOGS=/grafana/log" \
  #-e "GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource" \



#websocket port
#-p 9001:9001 \

docker stop grafana-img
docker rm grafana-img
docker run \
  --restart=always \
  --net=$NET \
  -p 3001:8081 \
  -tid \
  -e "GF_AUTH_ANONYMOUS_ENABLED=true" \
  --name $NET-grafana-img \
  grafana/grafana-image-renderer:2.0.0-beta1
