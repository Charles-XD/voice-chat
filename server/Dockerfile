FROM node:current-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --registry="https://mirror-npm.runflare.com"

COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]