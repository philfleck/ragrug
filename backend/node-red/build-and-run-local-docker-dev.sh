
PRJNAME=ragrug-server
APPNAME=app-$PRJNAME
#NET=$PRJNAME-net
NET=ragrug
#NET=host

echo "Project: $APPNAME"

#fix networking
#docker network rm $NET
#docker network create $NET


#start couchdb
#docker rm my-couchdb
#docker run -d -v $(pwd)/../couch_data:/opt/couchdb/data -p 5984:5984 --net vz_auth_net --name my-couchdb couchdb

#cp -f settings.js ../../mnt/settings.js

docker stop $APPNAME
docker build --force-rm -t $PRJNAME .
docker rm $APPNAME
docker run \
       -tid \
       -v $(pwd)/../../mnt:/data \
       --name $APPNAME \
       -p 1880:1880 \
       --net $NET \
       --restart=always \
       $PRJNAME 
       #/bin/bash

#docker run -it -v $(pwd)/../../mnt:/data --name $APPNAME -p 1880:1880 --net $NET $PRJNAME
#docker run -p 3000:3000 -d $APPNAME


# --name vizario_auth
#-v $(pwd)/src:/vizario_src \
#docker run -p 3000:3000 -d vizario_auth


#docker build -t vizario-auth .
#docker run --name vizario_auth -v $(pwd)/src:/vizario_src -t -i vizario_auth bash
