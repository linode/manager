#!/bin/bash
sleep 45s
yarn e2e:wait-for-manger-local
yarn e2e --visual --log
