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
RUN apt-get update \
    && apt-get install -y expect openssh-client \
    && rm -rf /var/cache/apt/* \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# e2e-install
#
# Installs Cypress and sets up cache directories.
FROM e2e-build as e2e-install
USER node
WORKDIR /home/node/app
VOLUME /home/node/app
ENV CYPRESS_CACHE_FOLDER=/home/node/.cache/Cypress
RUN mkdir -p /home/node/.cache/Cypress && cypress install

# `e2e`
#
# Runs Cloud Manager Cypress tests.
FROM e2e-install as e2e
WORKDIR /home/node/app
VOLUME /home/node/app
USER node
ENV CI=1
ENV NO_COLOR=1
ENV HOME=/home/node/
ENV CYPRESS_CACHE_FOLDER=/home/node/.cache/Cypress
