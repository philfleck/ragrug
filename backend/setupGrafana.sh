docker stop ragrug-grafana
cp grafana/conf/grafana.ini $(pwd)/../mnt/grafana/config/grafana.ini
docker start ragrug-grafana
