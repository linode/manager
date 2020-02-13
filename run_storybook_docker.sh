#!/bin/bash
echo "starting server"
nohup yarn storybook&
echo "waiting for storybook server to start"
# need npx for docker container
npx wait-on http://localhost:6006
yarn storybook:e2e
