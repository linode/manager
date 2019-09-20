#!/bin/bash

npx lerna run build --stream --scope linode-js-sdk && npx lerna run build --stream --scope linode-manager --color
npx lerna run serve --stream --scope linode-manager

