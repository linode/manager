#!/usr/bin/env zsh

VALID_PACKAGES=("manager" "api-v4" "validation")

# If the user provides a package save it to transform to all lowercase and set PACKAGE to it
# Otherwise default to manager package
PACKAGE=${1:="manager"}
PACKAGE=$PACKAGE:l

get_date_time() {
    echo $(date +"%FT%TZ")
}

get_changelog_entry() {
    package=$1
    if [[ $package == "manager" ]]; then
        file="./CHANGELOG.md"
    else
        file="packages/${package:l}/CHANGELOG.md"
    fi
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

get_version_from_changelog_entry() {
    changelog_entry=$1
    IFS=$' ' read -A word <<< $changelog_entry
    echo $word[4]
}

get_package_display_name() {
    package=$1
    case "$package" in
        "manager")
            title="Cloud Manager"
        ;;
        "api-v4")
            title="APIv4 JS Client"
        ;;
        "validation")
            title="Validation"
        ;;
    esac
    echo $title
}

generate_title_for_post() {
    package=$1
    version=$2
    case "$package" in
        "manager")
            title="Cloud Manager"
        ;;
        "api-v4")
            title="Linode APIv4 JS Client"
        ;;
        "validation")
            title="Linode Validation"
        ;;
    esac
    echo "$title $version"
}

generate_front_matter() {
    package=$1
    version=$2
    formated_version=${version/#v}
    title=$(generate_title_for_post $package $version)
    date=$(get_date_time)
    changelog=$(get_package_display_name $package)
    printf -- "---\ntitle: %s\ndate: %s\nversion: %s\nchangelog:\n  - %s\n---\n" "$title" "$date" "$formated_version" "$changelog"
}

generate_post_content() {
    front_matter=$1
    changelog_entry=$2
    changelog_length=${#changelog_entry}
    changelog_entry_without_version_and_date=${changelog_entry#*$'\n'}
    printf -- "%s\n\n%s\n" "$front_matter" "$changelog_entry_without_version_and_date"
}

generate_post_filename() {
    package=$1
    version=$2
    case "$package" in
        "manager")
            package_filename="cloud-manager-version"
        ;;
        "api-v4")
            package_filename="js-client-version"
        ;;
        "validation")
            package_filename="validation-changelog"
        ;;
    esac
    echo "$package_filename-${version//./-}.md"
}

if (($VALID_PACKAGES[(Ie)$PACKAGE])); then
    changelog_entry=$(get_changelog_entry $PACKAGE)
    version=$(get_version_from_changelog_entry "$changelog_entry")
    front_matter=$(generate_front_matter $PACKAGE $version)
    filename=$(generate_post_filename ${PACKAGE:l} $version)
    generate_post_content "$front_matter" "$changelog_entry" > "/tmp/$filename"
else
    echo "$PACKAGE is not a valid package"
    return 1
fi
