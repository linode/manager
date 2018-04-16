#!/bin/bash

$PWD/scripts/wait-for-it.sh -t 250 -s manager-storybook:6006 -- yarn storybook:e2e --log
status=$? # save it
find . -not -uid $(stat -c "%u" .) -exec chown --reference=. {} \;
exit $status
