#!/bin/bash

RELEASE_VERSION=$1
RELEASE_DATE=$2

#Get linode/manager repo name from remote branches
GET_ORIGIN=$(git remote -v | grep git@github.com:linode/manager.git)
if [[ -z $GET_ORIGIN ]]; then
  GET_ORIGIN=$(git remote -v | grep https://github.com/linode/manager)
fi
set -- $GET_ORIGIN
ORIGIN=$1
git fetch $ORIGIN

#Create release branch
git fetch $ORIGIN
git checkout develop
git rebase $ORIGIN/develop
git checkout -b release-$RELEASE_VERSION

#Generate changelog
python generate_changelog.py $RELEASE_VERSION $RELEASE_DATE $ORIGIN

#Create release tag & bump package.json version
yarn version --new-version $RELEASE_VERSION

#Commit updated version and new changelog
git commit -m "Cloud Manager version $RELEASE_VERSION - $RELEASE_DATE"

#Get previous release branch
PREVIOUS_RELEASE=$(git ls-remote --heads $ORIGIN | egrep -o 'release-\d*\.\d*\.\d*')

#Pause to manually check and edit change log, updated release version
read -p "WARNING: The upstream release-$PREVIOUS_RELEASE branch will be deleted and replaced with local branch release-$RELEASE_VERSION. Are you ready to release? (y/n) " -n 1 -r

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "You will need to delete release-$PREVIOUS_RELEASE manually and push release-$RELEASE_VERSION "
    exit 0
fi

#Git delete previous release branch
git push $ORIGIN  --delete $PREVIOUS_RELEASE

#Push release
git push $ORIGIN
git push --tags $ORIGIN
