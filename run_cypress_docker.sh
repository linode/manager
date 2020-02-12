#!/bin/bash
echo "starting server"
nohup yarn workspace linode-manager start&
echo "sleeping 60 sec for server to start on localhost:3000"
sleep 60
yarn cy:e2e
