FROM node:8.11.2-stretch

WORKDIR /packages/manager/src

# Install Deps
COPY package.json .
COPY yarn.lock .
COPY patches patches

RUN yarn

COPY . .

ENTRYPOINT ["yarn"]
