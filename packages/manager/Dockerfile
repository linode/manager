# Node.js base image for Cloud Manager CI tasks.
#
# Extends from the Node.js base image that corresponds with our latest supported
# version of Node, and includes other tools that we rely on like pnpm and bun.
FROM node:20.17-bullseye-slim as nodejs-cloud-manager
RUN npm install -g pnpm bun

# `manager`
#
# Serves Cloud Manager.
# Assumes Cloud Manager dependencies are installed at `/home/node/app/node_modules`,
# and Cloud Manager is built.
FROM nodejs-cloud-manager as manager
ENV NODE_ENV=development
WORKDIR /home/node/app
VOLUME /home/node/app
EXPOSE 3000/tcp

# Curl is needed for health check.
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/cache/apt/* \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean
CMD yarn start:manager:ci

# e2e-build
#
# Builds an image containing Cypress and miscellaneous system utilities required
# by the tests.
FROM cypress/included:13.11.0 as e2e-build
RUN npm install -g pnpm bun
USER node
WORKDIR /home/node/app
VOLUME /home/node/app
ENV CYPRESS_CACHE_FOLDER=/home/node/.cache/Cypress
RUN mkdir -p /home/node/.cache/Cypress && cypress install

# e2e
#
# Runs Cloud Manager Cypress tests.
FROM e2e-build as e2e
WORKDIR /home/node/app
VOLUME /home/node/app
USER node
ENV CI=1
ENV NO_COLOR=1
ENV HOME=/home/node/
ENV CYPRESS_CACHE_FOLDER=/home/node/.cache/Cypress

# e2e-reverse-proxy
#
# Runs Cloud Manager Cypress tests, with Caddy installed.
# Extends from `e2e`, and includes Caddy to support reverse proxying Cloud Manager.
FROM e2e as e2e-reverse-proxy
USER root
# Install Caddy.
# Instructions adapted from Caddy documentation at caddyserver.com:
# https://caddyserver.com/docs/install#debian-ubuntu-raspbian
RUN apt-get update \
    && apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list \
    && apt-get update \
    && apt-get install caddy
VOLUME /home/node/app
USER node
