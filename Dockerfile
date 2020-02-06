FROM node:10-alpine

# Run commands as "node" user. We don't want to run these commands as root
#
# See https://github.com/nodejs/docker-node/blob/d094c98a48659ff9f8d59db8dafb7020e181446a/docs/BestPractices.md
# and https://github.com/nodejs/docker-node/issues/1
WORKDIR /home/node/app
RUN chown -R node:node /home/node/app
USER node

# Copy the root level package.json and run yarn if anything changes
COPY --chown=node:node package.json yarn.lock tslint.json ./
RUN yarn

COPY --chown=node:node scripts ./scripts/

# Copy Cloud Manager deps
COPY --chown=node:node packages/manager/package.json ./packages/manager/
COPY --chown=node:node packages/manager/patches ./packages/manager/patches/

# Copy JS SDK deps
COPY --chown=node:node packages/linode-js-sdk/package.json ./packages/linode-js-sdk/

# Runs "yarn install" for all child packages
RUN yarn install:all

# Copy the rest of the files that don't require installation
COPY --chown=node:node packages/linode-js-sdk  ./packages/linode-js-sdk/

COPY --chown=node:node packages/manager ./packages/manager

ENTRYPOINT ["yarn"]
