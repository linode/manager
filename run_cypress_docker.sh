#!/bin/bash
echo "starting server"
nohup yarn workspace linode-manager start&
echo "Waiting for server to start on http://localhost:3000"
# need npx for docker container
yarn run wait-on http://localhost:3000
yarn cy:e2e
