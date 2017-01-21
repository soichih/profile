#!/bin/bash

#This script is used inside the docker container to start api and ui(via http-server)

echo "starting profile api"
pm2 start /app/api/profile.js

echo "starting http-server for ui"
http-server -p 80 -a 0.0.0.0 /app/ui
