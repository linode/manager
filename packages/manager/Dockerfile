# Registry to use when pulling images.
# Defaults to Docker Hub, but can be overriden to point to another registry if needed.
ARG IMAGE_REGISTRY=docker.io

# Node.js version to use.
ARG NODE_VERSION=20.17.0

# Cypress version.
ARG CYPRESS_VERSION=14.0.1

# Node.js base image for Cloud Manager CI tasks.
#
# Extends from the Node.js base image that corresponds with our latest supported
# version of Node, and includes other tools that we rely on like pnpm and bun.
FROM ${IMAGE_REGISTRY}/node:${NODE_VERSION}-bullseye-slim AS nodejs-cloud-manager
RUN npm install -g pnpm bun

# `manager`
#
# Serves Cloud Manager.
# Assumes Cloud Manager dependencies are installed at `/home/node/app/node_modules`,
# and Cloud Manager is built.
FROM nodejs-cloud-manager AS manager
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
CMD pnpm start:manager:ci

# e2e-build
#
# Builds an image containing Cypress and miscellaneous system utilities required
# by the tests.
#
# Uses Cypress factory image. For more information, see:
# https://github.com/cypress-io/cypress-docker-images/tree/master/factory#usage
FROM ${IMAGE_REGISTRY}/cypress/factory:5.2.1 AS e2e-build
ARG CYPRESS_VERSION
ARG NODE_VERSION
# Add Chrome apt repo
RUN apt-get update \
    && apt-get install -y wget gnupg2 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update

RUN apt-get install -y google-chrome-stable \
    && rm -rf /var/cache/apt/* \
    && rm -rf /var/lib/apt/lists* \
    && apt-get clean \
    && npm install -g cypress@${CYPRESS_VERSION} pnpm bun yarn

USER node
WORKDIR /home/node/app
VOLUME /home/node/app
ENV CYPRESS_CACHE_FOLDER=/home/node/.cache/Cypress
RUN mkdir -p /home/node/.cache/Cypress && cypress install

# e2e
#
# Runs Cloud Manager Cypress tests.
FROM e2e-build AS e2e
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
FROM e2e AS e2e-reverse-proxy
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
