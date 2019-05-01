#!/bin/bash

# Confirm Branch includes M3 Ticket
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
BRANCH_INCLUDES_TICKET=$(git rev-parse --abbrev-ref HEAD | egrep -i '(M3-[0-9]*)|feature|develop|master|release-.*|OBJ.*|LKE.*')
RED='\033[0;31m'

if [ $BRANCH_INCLUDES_TICKET ]
then
    exit 0
else
    echo -e "\n\n${RED}Failed to push branch \"$BRANCH_NAME\".\
      \nPlease check that it contains a JIRA ticket in the branch name."

    echo -e "\nExample: \"M3-111-Feature\"\n"
    exit 1
fi
