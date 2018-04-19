#!/bin/bash

$PWD/scripts/wait-for-it.sh -t 250 -s manager-storybook:6006 -- yarn storybook:e2e --log
status=$? # save it
chown -R jenkins **/storybook-test-results && chown -R jenkins **/e2e
exit $status
