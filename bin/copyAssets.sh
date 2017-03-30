#!/usr/bin/env bash

mkdir -p assets/weblish
cp node_modules/xterm/dist/{xterm.js,xterm.css,xterm.js.map} assets/weblish

mkdir -p assets/glish/novnc
cp -r node_modules/novnc/include/ assets/glish/novnc
