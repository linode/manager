#!/bin/bash

RELEASE=$1
RELEASE_DATE=$2

#Get linode/manager repo name from remote branches
GET_ORIGIN=$(git remote -v | grep git@github.com:linode/manager.git)
set -- $GET_ORIGIN
ORIGIN=$1

#Create release branch
git fetch $ORIGIN
git checkout develop
git git rebase $ORIGIN/develop
git checkout -b release-$RELEASE

#Generate changelog
cd ..
python generate_changelog.py $RELEASE $RELEASE_DATE

#Update Yarn versions
yarn version --new-version $RELEASE

#Git delete previous release branch
PREVIOUS_RELEASE=$(git ls-remote --heads $ORIGIN | egrep -o 'release-\d*\.\d*\.\d*')
git push $ORIGIN  --delete $PREVIOUS_RELEASE

#Push release
git commit -m "Cloud Manager version $RELEASE - $RELEASE_DATE"
git push
