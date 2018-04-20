#!/bin/bash

$PWD/scripts/wait-for-it.sh -t 250 -s manager-storybook:6006 -- yarn storybook:e2e --log
status=$? # save it
pwd
ls -lah
chown -R jenkins:jenkins **/storybook-test-results **/e2e **/src
exit $status
