ARG NODE_VERSION=8.15.1
FROM node:${NODE_VERSION}
MAINTAINER blake:2019/4/8

ENV PROJECT_NAME member-control-panel-frontend
ENV CODE_PATH /var/web/www/$PROJECT_NAME

RUN npm install -g yarn \
    && npm install -g justreq-cli

WORKDIR $CODE_PATH

COPY . $CODE_PATH
