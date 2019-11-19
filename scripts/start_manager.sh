#!/bin/sh

#npx lerna run build --stream --scope linode-js-sdk && npx lerna run build --stream --scope linode-manager --color
yarn build
#npx lerna run serve --stream --scope linode-manager
yarn up
