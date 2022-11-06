#!/bin/bash
read -p "Enter the database password: " dbPass
docker build -t ctf_cafe/backend .
docker stop backend_1
docker rm backend_1
docker run -d -p 3001:3001 -e MONGODB_CONNSTRING="mongodb://dev:$dbPass@$(docker inspect -f '{{.NetworkSettings.IPAddress}}' mongodb):27017/ctfDB?directConnection=true&authSource=admin" -v /home/dev/CTF_Cafe/backEnd/assets:/server/assets -v /home/dev/CTF_Cafe/backEnd/dockers:/server/dockers --name backend_1 ctf_cafe/backend
