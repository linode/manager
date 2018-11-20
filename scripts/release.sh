#!/bin/bash

RELEASE_TAG=$1
RELEASE_DATE=$2
cd ..

#Get linode/manager repo name from remote branches
GET_ORIGIN=$(git remote -v | grep git@github.com:linode/manager.git)
set -- $GET_ORIGIN
ORIGIN=$1

#Create release branch
git fetch $ORIGIN
git checkout develop
git rebase $ORIGIN/develop
git checkout -b release-$RELEASE_TAG

#Generate changelog
python generate_changelog.py $RELEASE_TAG $RELEASE_DATE

#Create release tag & bump package.json version
yarn version --new-version $RELEASE_TAG

#Commit updated version and new changelog
git commit -m "Cloud Manager version $RELEASE_TAG - $RELEASE_DATE"

#Git delete previous release branch
PREVIOUS_RELEASE=$(git ls-remote --heads $ORIGIN | egrep -o 'release-\d*\.\d*\.\d*')
git push $ORIGIN  --delete $PREVIOUS_RELEASE

#Push release
git push $ORIGIN
git push --tags $ORIGIN
