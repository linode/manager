GET_ORIGIN=$(git remote -v | grep git@github.com:linode/manager.git)
if [[ -z $GET_ORIGIN ]]; then
  GET_ORIGIN=$(git remote -v | grep https://github.com/linode/manager.git)
fi
set -- $GET_ORIGIN
ORIGIN=$1
echo $ORIGIN
git fetch $ORIGIN
yarn e2e --spec=$(git diff --name-only $ORIGIN/develop | egrep 'e2e/specs/.*\/*spec.js' | tr '\n' ',' | sed 's/.$//')
