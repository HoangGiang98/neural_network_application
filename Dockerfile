FROM node:18-buster-slim

WORKDIR /app

RUN mkdir ./neural_network_service
RUN mkdir ./neural_network_frontend

COPY /neural_network_service/package*.json ./neural_network_service

COPY /neural_network_frontend/package*.json ./neural_network_frontend

COPY /package*.json ./

RUN npm run install:client

RUN npm run install:server

COPY . .

ENV PORT=8080

EXPOSE 8080

RUN npm run build:client

RUN npm run build:server

RUN npm run package

CMD ["npm", "run", "start"]

