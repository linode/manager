FROM node:10-alpine as base

# Run commands as "node" user. We don't want to run these commands as root
#
# See https://github.com/nodejs/docker-node/blob/d094c98a48659ff9f8d59db8dafb7020e181446a/docs/BestPractices.md
# and https://github.com/nodejs/docker-node/issues/1
# https://stackoverflow.com/questions/18136746/npm-install-failed-with-cannot-run-in-wd
WORKDIR /home/cloud
RUN chown -R node:node /home/cloud
USER node
RUN yarn global add lerna

# Copy the root level package.json and run yarn if anything changes
COPY --chown=node:node package.json yarn.lock tslint.json ./
RUN yarn

# Copy lerna.json
COPY --chown=node:node lerna.json .
COPY --chown=node:node scripts ./scripts/

# Copy Cloud Manager deps
COPY --chown=node:node packages/manager/package.json ./packages/manager/
COPY --chown=node:node packages/manager/patches ./packages/manager/patches/

# Copy JS SDK deps
COPY --chown=node:node packages/linode-js-sdk/package.json ./packages/linode-js-sdk/

RUN yarn install:all

RUN mkdir ./packages/manager/ouput && mkdir ./build

COPY --chown=node:node . ./

FROM base as sdk_build
RUN npx lerna run build --scope linode-js-sdk
