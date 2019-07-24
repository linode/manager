#!/bin/bash

lerna run build --scope linode-manager

lerna run serve --scope linode-manager
