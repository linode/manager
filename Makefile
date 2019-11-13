path=$(shell pwd)

start:
	docker build --target base -t acourdavault/linodecloud:base .

publish: start
	docker push acourdavault/linodecloud:base
# check: start
# 	docker start --name check acourdavault/linodecloud:base

sdk:
	docker build --target sdk_build -t acourdavault/linodecloud:sdk .

build: sdk
	docker run --name build -v ${path}/build:/home/cloud/build acourdavault/linodecloud:sdk npx lerna run build --scope linode-manager
	docker cp build:/home/cloud/packages/manager/build ${path}/packages/manager/build

jest: sdk
	docker run --name jest acourdavault/linodecloud:sdk yarn test
	docker cp jest:/home/cloud/packages/manager/junit.xml ${path}/packages/manager/junit.xml
	docker cp jest:/home/cloud/packages/manager/output ${path}/packages/manager/
	docker cp jest:/home/cloud/packages/manager/test-report.xml ${path}/packages/manager/test-report.xml
	docker rm jest
# storybook: sdk
# 	yarn storybook&
# 	docker run --rm --name storybook -p 6006:6006 -v ${path}/packages/manager/storybook-test-results:/home/cloud/packages/manager/storybook-test-results acourdavault/linodecloud:sdk yarn storybook:e2e

analyze: jest
	docker run --rm --name sonarcloud -e SONAR_TOKEN=63b59b1379995d0bd89e53c6239396431f96bc51 -v "${path}:/usr/src" -v"${path}/.sonarcloud.properties:/opt/sonar-scanner/conf/sonar-scanner.properties" sonarsource/sonar-scanner-cli

e2e: sdk
	# docker run --rm --name selenium -d -it --shm-size=2g selenium/standalone-chrome
	docker run --rm -d -it --name manager acourdavault/linodecloud:sdk yarn up
	docker run --rm --name e2e --link manager acourdavault/linodecloud:base yarn e2e
	docker stop manager

test: jest storybook
	echo "Jest and Storybook done"

all: build test
	echo "All done"