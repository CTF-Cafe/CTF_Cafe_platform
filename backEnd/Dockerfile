FROM node:18-alpine  

WORKDIR /server

COPY package.json ./

RUN npm install --production

COPY . .

EXPOSE 3001

CMD npm start
