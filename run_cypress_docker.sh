#!/bin/bash
echo "starting server"
nohup yarn workspace linode-manager start&
PID=$!
echo "Waiting for server to start on http://localhost:3000, PID $PID"
# need npx for docker container
yarn run wait-on http://localhost:3000
yarn cy:e2e
kill $PID
