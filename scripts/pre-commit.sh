#!/bin/bash

# Get files changed in commit
changes=$( git diff --cached --name-status | awk '$1 != "D" { print $2 }' )

(
yarn lint
echo $? >| .tmp.lint.status
) &
(
# Run TSC to check for type errors, does not emit files.
yarn tsc --noEmit
echo $? >| .tmp.tsc.status
) &
(
yarn test --findRelatedTests $changes --passWithNoTests
echo $? >| .tmp.test.status
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
    echo $? >| .tmp.storybook.status

    # Ensure we cleanup any leftover processes
    $( pkill -f selenium-standalone || : )

    if [[ $storybookRunning -eq "1" ]]; then
        $( pkill -f storybook )
    fi
) &
else
    storybookStatus=0
fi

# Wait for sub-shells to exit
wait

lintStatus=$( cat .tmp.lint.status )
testStatus=$( cat .tmp.test.status )
tscStatus=$( cat .tmp.tsc.status )

if [[ -z ${storybookStatus+x} ]]; then
storybookStatus=$( cat .tmp.storybook.status )
fi

status=$(($lintStatus + $testStatus + $storybookStatus + $tscStatus))

# Remove temp files
$( rm -rf .tmp.lint.status .tmp.test.status .tmp.storybook.status .tmp.)

exit $status
