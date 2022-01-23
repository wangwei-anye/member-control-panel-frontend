FROM hk01/docker-node:8.15-v0.1.4 AS builder

ARG BUILD_ENV

WORKDIR /srv

COPY . .

RUN yarn \
    && npm run build:${BUILD_ENV}


## finally build stage
FROM hk01/docker-nginx:v0.4 AS finally

WORKDIR /srv

COPY --from=builder /srv/dist/. .