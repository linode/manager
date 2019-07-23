#!/bin/bash

yarn storybook-static
cd .out
echo "Starting Http server"
python -m SimpleHTTPServer 6006
