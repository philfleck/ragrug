docker stop app-ragrug-server
rm -rf $(pwd)/../mnt/node-red/settings.js
cp node-red/settings.js $(pwd)/../mnt/node-red/settings.js
cp -n node-red/flows/rr_002.json $(pwd)/../mnt/node-red/flows.json
docker start app-ragrug-server
