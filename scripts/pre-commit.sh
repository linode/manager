#!/bin/bash

changes=$( git diff --cached --name-status | awk '$1 != "D" { print $2 }' )

yarn lint
status=$?

yarn test
status=$(($status + $?))

if [[ $changes =~ .*src\/components.* ]]; then
    yarn storybook:e2e
    status=$(($status + $?))

    # Ensure we cleanup any leftover selenium processes
    $( pkill -f selenium-standalone )
fi

exit $status