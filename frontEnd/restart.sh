#!/bin/bash
docker build -t ctf_cafe/frontend .
docker stop frontend_1
docker rm frontend_1
docker run -d -p 3000:3000 --name frontend_1 ctf_cafe/frontend