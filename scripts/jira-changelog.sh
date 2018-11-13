#!/bin/bash

CHANGES_WITH_TIX=$(git log --color=always --no-merges --oneline $1...HEAD | egrep -i '(M3(-|\s)[0-9]*)')
CHANGES_WITHOUT_TIX=$(git log --color=always --no-merges --oneline $1...HEAD | egrep -iv '(M3(-|\s)[0-9]*)')
JQL_QUERY=$(echo "key in ($(git log --color=always --no-merges --oneline $1...HEAD | egrep -oi --color=always '(M3(-|\s)[0-9]*)' | tr '\n' ',' | sed 's/.$//' | tr ' ' '-'))" )

echo -e "Tracked Changes in $1:\n"
echo "$CHANGES_WITH_TIX"
echo -e "\nUntracked Changes in $1:\n"
echo "$CHANGES_WITHOUT_TIX"
echo -e "\nJQL QUERY: \n\n$JQL_QUERY\n\a"
