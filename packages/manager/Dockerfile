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

# `e2e`
#
# Runs Cloud Manager Cypress tests.
FROM cypress/included:12.17.3 as e2e
WORKDIR /home/node/app
VOLUME /home/node/app
USER node
RUN mkdir -p /home/node/.cache/Cypress
ENV CI=1
ENV NO_COLOR=1
ENV HOME=/home/node/
ENV CYPRESS_CACHE_FOLDER=/home/node/.cache/Cypress
ENTRYPOINT yarn cy:ci

# TODO Add `e2e-m1`.
