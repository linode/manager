# `manager`
#
# Serves Cloud Manager.
FROM node:14.17-bullseye-slim as manager
ENV NODE_ENV=development
WORKDIR /home/node/app
VOLUME /home/node/app
EXPOSE 3000/tcp
# Curl is needed for health check.
RUN apt-get update && apt-get install -y curl
CMD yarn start:manager:ci

# `e2e`
#
# Runs Cloud Manager Cypress tests.
FROM cypress/included:9.6.0 as e2e
WORKDIR /app
ENV CI=1
# RUN yarn cypress install
ENTRYPOINT [ "yarn", "cy:ci" ]

# TODO Add `e2e-m1`.
