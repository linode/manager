#!/bin/bash

# Get files changed in commit
changes=$( git diff --cached --name-status | awk '$1 != "D" { print $2 }' )
status=0

(
yarn lint
status=$(($status + $?))
) &
(
yarn test
status=$(($status + $?))
) &

# Run storybook tests if components are changed
if [[ $changes =~ .*src\/components.* ]]; then
(
    # Check if storybook is running
    nc -z -w5 localhost 6006 > /dev/null 2>&1
    storybookRunning=$?

    if [[ $storybookRunning -eq "0" ]]; then
        yarn storybook:e2e
    else 
        yarn storybook > /dev/null 2>&1 &
        yarn storybook:e2e
    fi
    status=$(($status + $?))

    # Ensure we cleanup any leftover processes
    $( pkill -f selenium-standalone )
    
    if [[ $storybookRunning -eq "1" ]]; then
        $( pkill -f storybook )
    fi
) &
fi

wait
exit $status
