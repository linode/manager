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
WORKDIR /home/node/app
VOLUME /home/node/app
# RUN chmod 777 /root
# RUN mv /root/.cache /home/node/.cache
# RUN chown node:node /home/node/.cache
# RUN chmod 777 /home/node/.cache

USER node
RUN mkdir -p /home/node/.cache/Cypress
ENV CI=1
ENV HOME=/home/node/
ENV CYPRESS_CACHE_FOLDER=/home/node/.cache/Cypress
ENTRYPOINT [ "yarn", "cy:ci" ]

# TODO Add `e2e-m1`.
