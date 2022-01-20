NET=ragrug

#https://hub.docker.com/_/couchdb

docker stop $NET-postgres
docker rm $NET-postgres
docker run \
  --restart=always \
  --net=$NET \
  -p 5432:5432 \
  -tid \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_USER=user \
  --name $NET-postgres \
  postgres

#-v $(pwd)/../../mnt/postgres/data:/var/lib/postgresql/data \
