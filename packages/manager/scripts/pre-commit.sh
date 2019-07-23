#!/bin/bash

# Get files changed in commit and remove packages/manager from each git changed file
changes=$( git diff --cached --name-status | awk '$1 != "D" { print $2 }' )
PHRASETOREMOVE="packages/manager/"
changes=${changes//$PHRASETOREMOVE/}

ls & (
yarn lint
echo $? >| .tmp.lint.status
) &
(
# Run TSC to check for type errors, does not emit files.
yarn tsc --noEmit
echo $? >| .tmp.tsc.status
) &
(
yarn test --passWithNoTests --findRelatedTests $changes
echo $? >| .tmp.test.status
) &

# Wait for sub-shells to exit
wait

lintStatus=$( cat .tmp.lint.status )
testStatus=$( cat .tmp.test.status )
tscStatus=$( cat .tmp.tsc.status )

status=$(($lintStatus + $testStatus + $tscStatus))

# Remove temp files
$( rm -rf .tmp.lint.status .tmp.test.status .tmp.storybook.status .tmp.)

exit $status