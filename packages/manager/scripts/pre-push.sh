#!/bin/bash

RED='\033[0;31m'

# Fail if there are staged temporary constants defined in packages/manager/src/constants.ts
HAS_STAGED_CONSTANTS=$(git diff --name-only --cached | grep "constants.ts")
HAS_TMP_CONSTANTS=$(grep -q "// TMP - REMOVE ME" src/constants.ts > /dev/null; echo $?)
if [ "$HAS_STAGED_CONSTANTS" ] && [ "$HAS_TMP_CONSTANTS" -eq 0 ]; then
    echo -e "\n\n${RED}Temporary constants must be removed or unstaged.\nCheck packages/manager/src/constants.ts\n\n"
    exit 1
fi

# Confirm Branch includes M3 Ticket
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
BRANCH_INCLUDES_TICKET=$(git rev-parse --abbrev-ref HEAD | egrep -i '(M3-[0-9]*)|feature|patch|staging|develop|testing|master|release-.*|OBJ.*|LKE.*|OCA.*')


if [ "$BRANCH_INCLUDES_TICKET" ]
then
    exit 0
else
    echo -e "\n\n${RED}Failed to push branch \"$BRANCH_NAME\".\
      \nPlease check that it contains a JIRA ticket in the branch name."

    echo -e "\nExample: \"M3-111-Feature\"\n"
    exit 1
fi