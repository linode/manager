#!/bin/bash
echo "starting server"
nohup yarn storybook&
PID=$!
echo "waiting for storybook server to start, PID $PID"
# need npx for docker container
yarn run wait-on http://localhost:6006
yarn storybook:e2e
kill $PID