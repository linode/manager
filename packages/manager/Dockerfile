# `manager`
#
# Serves Cloud Manager.
FROM node:18.14-bullseye-slim as manager
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
FROM cypress/included:13.5.0 as e2e-build
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
ENTRYPOINT yarn cy:ci
