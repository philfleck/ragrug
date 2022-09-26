docker stop app-ragrug-server
cp -f node-red/settings.js $(pwd)/../mnt/settings.js
cp -n node-red/flows/rr_last.json $(pwd)/../mnt/flows.json
docker start app-ragrug-server
