#!/usr/bin/env bash

set -eux

mkdir -p assets/weblish
cp node_modules/xterm/dist/{xterm.js,xterm.css,xterm.js.map} assets/weblish

cp node_modules/zxcvbn/dist/{zxcvbn.js,zxcvbn.js.map} assets/

mkdir -p assets/font-awesome/css
cp node_modules/font-awesome/css/font-awesome.min.css assets/font-awesome/css
cp -r node_modules/font-awesome/fonts assets/font-awesome/
