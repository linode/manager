#!/bin/bash
echo "starting server"
nohup yarn storybook&
echo "sleeping 60 sec for storybook server to start"
sleep 60
yarn storybook:e2e
