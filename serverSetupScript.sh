#!/bin/bash
 
export domainSetup="true" # IF TRUE NEEDS TO BE RUN AFTER DNS SETUP
export domainName="dev.ctf.cafe"
export ctfName="TEST_CTF"
export dbPass="$(uuidgen)"
export sessionKey="$(uuidgen)"
export devPassword="dev_password"

# Installs
apt-get -y update
apt-get -y install nginx docker.io

# Firewall
ufw allow ssh
ufw allow 'Nginx Full'
echo 'y' | ufw enable

# Nginx Setup
cd /etc/nginx/sites-available/
rm default
rm ../sites-enabled/default
echo "
limit_conn_zone \$binary_remote_addr zone=addr:10m;
limit_req_zone \$binary_remote_addr zone=high:10m rate=10r/m;
limit_req_zone \$binary_remote_addr zone=low:10m rate=10r/s;

server {
    listen 80;

    client_body_timeout 10s;
    client_header_timeout 10s;

    server_name "$( if [[ $domainSetup = 'true' ]]; then echo $domainName; else hostname -I | awk -F ' ' '{ print $1 }'; fi; )";

    location / {
        limit_conn addr 8;
        limit_req zone=low burst=20 nodelay;

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        limit_conn addr 8;

        location /api/submitFlag {
            limit_req zone=high burst=5 nodelay;
            proxy_pass http://127.0.0.1:3001;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
        }


        location /api/login {
            limit_req zone=high burst=2 nodelay;
            proxy_pass http://127.0.0.1:3001;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
        }

        location /api/register {
            limit_req zone=high;
            proxy_pass http://127.0.0.1:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
        }

        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}" > ctf.conf
cd ../sites-enabled
ln -s ../sites-available/ctf.conf .

if [[ $domainSetup = 'true' ]] 
then 
    apt-get -y install snapd
    snap install core
    snap install --classic certbot
    ln -s /snap/bin/certbot /usr/bin/certbot
    certbot --nginx -d $domainName --agree-to --email "dev@$domainName" -n
fi 

service nginx reload

# Create dev user & switch to it
useradd -m dev
echo "dev:$devPassword" | chpasswd --encrypted
usermod -aG docker dev
touch /home/dev/devSetup.sh

#Save Assets
cp -r /home/dev/CTF_Cafe/backEnd/assets /tmp/assets

# Clean old versions
rm -f -r /home/dev/CTF_Cafe

cat >/home/dev/devSetup.sh <<'EOF'
#!/bin/bash

cd /home/dev/

# MongoDB setup
docker stop mongodb
docker rm mongodb
docker run --name mongodb -d -e MONGO_INITDB_ROOT_USERNAME=dev -e MONGO_INITDB_ROOT_PASSWORD=$dbPass -v /root/db:/data/db mongo

# FrontEnd & BackEnd setup
git clone https://github.com/CTF-Cafe/CTF_Cafe.git
cd CTF_Cafe/frontEnd
echo "
    REACT_APP_SERVER_URI="$( if [ $domainSetup = 'true' ]; then echo https://$domainName; else hostname -I | awk -F ' ' '{ print "http://"$1 }'; fi; )"
    REACT_APP_CTF_NAME=$ctfName
    GENERATE_SOURCEMAP=false
" > .env
docker build -t ctf_cafe/frontend .
docker stop frontend_1
docker rm frontend_1
docker run -d -p 3000:3000 --name frontend_1 ctf_cafe/frontend
cd ../backEnd
echo "
    SECRET_KEY=$sessionKey
    NODE_ENV=production
    FRONTEND_URI="$( if [ $domainSetup = 'true' ]; then echo https://$domainName; else hostname -I | awk -F ' ' '{ print "http://"$1 }'; fi; )"
" > .env
docker build -t ctf_cafe/backend .
docker stop backend_1
docker rm backend_1
docker run -d -p 3001:3001 -e MONGODB_CONNSTRING="mongodb://dev:$dbPass@$(docker inspect -f '{{.NetworkSettings.IPAddress}}' mongodb):27017/ctfDB?directConnection=true&authSource=admin" -v ~/CTF_Cafe/backEnd/assets:/server/assets --name backend_1 ctf_cafe/backend

#Re-Add Assets
cp /tmp/assets/* /home/dev/CTF_Cafe/backEnd/assets/
EOF

chmod 707 /home/dev/devSetup.sh

su dev /home/dev/devSetup.sh
