NET=ragrug

#https://hub.docker.com/_/couchdb

docker stop $NET-couchdb
docker rm $NET-couchdb
docker run \
  --restart=always \
  --net=$NET \
  -p 5984:5984 \
  -tid \
  -v $(pwd)/../../mnt/couchdb/data:/opt/couchdb/data \
  -v $(pwd)/../../mnt/couchdb/etc:/opt/couchdb/etc/local.d \
  -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=123456 \
  --name $NET-couchdb \
  couchdb
