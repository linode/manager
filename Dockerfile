FROM node:8.11.2-stretch

# Install Lerna globally
RUN yarn global add lerna

WORKDIR /src

# Install Deps
COPY lerna.json .
COPY package.json .
COPY packages/manager/package.json ./packages/manager/package.json
COPY packages/manager/yarn.lock ./packages/manager/yarn.lock
COPY packages/manager/patches ./packages/manager/patches

# solves for https://github.com/npm/npm/issues/19479
RUN yarn config set unsafe-perm true
RUN lerna bootstrap

WORKDIR /src/packages/manager
COPY packages/manager .
WORKDIR /src

CMD lerna run serve --scope linode-manager

ENTRYPOINT ["lerna", "run"]
