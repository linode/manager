#!/bin/bash

# Compare first tag/commit argument to Second commit/tag argument OR head
COMPARE_TO=${2:-HEAD}

CHANGES_WITH_TIX=$(git log --color=always --no-merges --oneline $1...$COMPARE_TO | egrep -i '(M3(-|\s)[0-9]*)')
CHANGES_WITHOUT_TIX=$(git log --color=always --no-merges --oneline $1...$COMPARE_TO | egrep -iv '(M3(-|\s)[0-9]*)')
JQL_QUERY=$(echo "key in ($(git log --color=always --no-merges --oneline $1...$COMPARE_TO | egrep -oi --color=always '(M3(-|\s)[0-9]*)' | tr '\n' ',' | sed 's/.$//' | tr ' ' '-'))" )

echo -e "Tracked Changes in $1:\n"
echo "$CHANGES_WITH_TIX"
echo -e "\nUntracked Changes in $1:\n"
echo "$CHANGES_WITHOUT_TIX"
echo -e "\nJQL QUERY: \n\n$JQL_QUERY\n\a"
