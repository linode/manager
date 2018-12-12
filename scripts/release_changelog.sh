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
#Clean working tree
git reset --hard
#Create release branch
git fetch $ORIGIN
git checkout develop
git rebase $ORIGIN/develop
git checkout -b release-$RELEASE_VERSION
 #Generate changelog
python generate_changelog.py $RELEASE_VERSION $RELEASE_DATE $ORIGIN
