#!/usr/bin/env bash

get_changelog_entry() {
    file="packages/validation/CHANGELOG.md"
    declare -a changelog_lines
    number_of_release_headers_read=0

    while IFS=$'\n' read -r line; do
        if [[ $line = *"## ["* ]]; then
            ((number_of_release_headers_read++))
        fi

        if [[ $number_of_release_headers_read -lt 2 && $number_of_release_headers_read -ge 1 ]]; then
            changelog_lines+=("$line")
        fi
    done < "$file"
    IFS=$'\n'
    printf "%s\n" ${changelog_lines[@]}
}

get_changelog_entry
