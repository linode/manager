#!/bin/bash

$PWD/scripts/wait-for-it.sh -t 250 -s manager-storybook:6006 -- yarn storyshots -u
