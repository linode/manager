# `build`
#
# Installs dependencies and builds Cloud Manager.
FROM node:14.17-bullseye-slim as build
ENV NODE_ENV=development
WORKDIR /home/node/app
COPY . .
RUN yarn install:all
RUN yarn build

# `manager`
#
# Serves Cloud Manager.
FROM node:14.17-bullseye-slim as manager
ENV NODE_ENV=development
WORKDIR /home/node/app
EXPOSE 3000/tcp
COPY --from=0 /home/node/app /home/node/app
CMD yarn start:manager:ci

# `e2e`
#
# Runs Cloud Manager Cypress tests.
FROM cypress/included:9.6.0 as e2e
WORKDIR /app
COPY --from=0 /home/node/app /app
RUN apt-get install \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb
ENV CI=1
RUN yarn cypress install
ENTRYPOINT [ "yarn", "cy:run" ]

# TODO Add `e2e-m1`.
