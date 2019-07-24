FROM node:8.11.2-stretch

WORKDIR /src

# Install Deps
COPY packages/manger/package.json .
COPY packages/manger/yarn.lock .
COPY packages/manger/patches patches

RUN yarn

COPY ./packages/manager .

ENTRYPOINT ["yarn"]
