#!/bin/sh
#cp -rn /nrm/node_modules/* /ragrug_mnt/node-red/node_modules/*
rsync -a -v --ignore-existing /nrm/node_modules /ragrug_mnt/node-red

echo "booting node-red"
node-red -u /ragrug_mnt/node-red 
