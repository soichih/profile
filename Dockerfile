FROM node:4

COPY . /app

RUN cd /app && npm install --production

EXPOSE 8080

WORKDIR /app
CMD [ "npm", "start" ]

