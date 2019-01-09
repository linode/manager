#!/bin/bash
sleep 30s
yarn e2e:wait-for-it
yarn e2e --visual --log
