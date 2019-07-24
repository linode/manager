FROM node:8.11.2-stretch

WORKDIR /src

# Install Deps
COPY packages/manager/package.json .
COPY packages/manager/yarn.lock .
COPY packages/manager/patches patches

RUN yarn

COPY packages/manager .

ENTRYPOINT ["yarn"]
