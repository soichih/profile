FROM node:6

MAINTAINER Soichi Hayashi <hayashis@iu.ed>

RUN npm install http-server -g && \
    npm install pm2 -g

COPY . /app
WORKDIR /app
RUN npm install --production

EXPOSE 80
EXPOSE 8080

CMD [ "/app/docker/start.sh" ]

