FROM node:8.11.2-stretch

# Install Lerna globally
RUN yarn global add lerna

WORKDIR /src

# Install Deps
COPY packages/manager/package.json .
COPY packages/manager/yarn.lock .
COPY packages/manager/patches patches

RUN lerna bootstrap

COPY . .

ENTRYPOINT ["lerna", "run", "build", "--scope", "linode-manager"]
CMD lerna run serve --scope linode-manager
