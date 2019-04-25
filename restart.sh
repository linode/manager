#!/bin/bash

killall node yarn

# git submodule update --init --recursive;

# export SENTRY_URL='https://e095590e3260485fb00388aa108eaecc@sentry.io/287725';

case "$1" in
	alpha|testing)
        cat > .env <<EOF
REACT_APP_CLIENT_ID=ff299b4792c5ac8854cb
REACT_APP_API_ROOT=https://api.testing.linode.com/v4
REACT_APP_LOGIN_ROOT=https://login.testing.linode.com
REACT_APP_LISH_ROOT='wss://list.testing.linode.com';
EOF
		;;
	preprod|stage|staging)
        cat > .env <<EOF
REACT_APP_CLIENT_ID=ff299b4792c5ac8854cb
REACT_APP_API_ROOT=https://api-staging.linode.com/v4
REACT_APP_LOGIN_ROOT=https://login.linode.com
EOF
		;;
	prod|production)
        cat > .env <<EOF
REACT_APP_CLIENT_ID=ff299b4792c5ac8854cb
REACT_APP_API_ROOT=https://api.linode.com/v4
REACT_APP_LOGIN_ROOT=https://login.linode.com
REACT_APP_LISH_ROOT=webconsole.linode.com
REACT_APP_ALGOLIA_APPLICATION_ID="KGUN8FAIPF"
REACT_APP_ALGOLIA_SEARCH_KEY="d4847002cd30392fe0fbd00a1da933ed"
REACT_APP_IS_OBJECT_STORAGE_ENABLED=true
MANAGER_USER=prod-test-012
MANAGER_PASS=PGQN4sWNs*A^4pKMqw^QK8dULhRq9s2Nz4
REACT_APP_APP_ROOT='http://localhost:3000'
MANAGER_OAUTH=c2b01273ed9d7f9bd5d1a88e359700950acedf0f33ba29887f77a5166917b7bd
EOF
		;;
	mock|mock)
        cat > .env <<EOF
REACT_APP_CLIENT_ID=ff299b4792c5ac8854cb
REACT_APP_API_ROOT=https://localhost:8088/v4
REACT_APP_LOGIN_ROOT=https://login.linode.com
REACT_APP_LISH_ROOT=webconsole.linode.com
REACT_APP_ALGOLIA_APPLICATION_ID="KGUN8FAIPF"
REACT_APP_ALGOLIA_SEARCH_KEY="d4847002cd30392fe0fbd00a1da933ed"
REACT_APP_IS_OBJECT_STORAGE_ENABLED=true
EOF
		;;
	dev|devel|development)
        cat > .env <<EOF
REACT_APP_CLIENT_ID=78487a5a2b3cf961ddf0
REACT_APP_API_ROOT=https://api.dev.linode.com/v4
REACT_APP_LOGIN_ROOT=https://login.dev.linode.com
ALGOLIA_APPLICATION_ID='KGUN8FAIPF'
ALGOLIA_SEARCH_KEY='d4847002cd30392fe0fbd00a1da933ed'
REACT_APP_IS_OBJECT_STORAGE_ENABLED=true
EOF
		;;
	local|vagrant|*)
        cat > .env <<EOF
REACT_APP_CLIENT_ID=59e24f657a435f9a7ea9
REACT_APP_API_ROOT=https://api.lindev.local/v4
REACT_APP_LOGIN_ROOT=https://login.lindev.local
REACT_APP_LISH_ROOT='wss://mlish-london.lindev.local';
EOF
		;;
esac

yarn start
