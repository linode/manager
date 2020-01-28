docker run --rm -v $(pwd):/usr/src/app -w /usr/src/app node:10-alpine yarn install:all
docker run --rm -v $(pwd):/usr/src/app -w /usr/src/app node:10-alpine yarn workspace linode-js-sdk build
docker run --rm -v $(pwd):/usr/src/app -w /usr/src/app node:10-alpine yarn test --coverage --coverageDirectory=output/coverage/jest

ls packages/manager
ls packages/manager/output/coverage/jest

mkdir .sonar

echo sonar.projectKey=acourdavault_manager > sonar-scanner.properties
echo sonar.organization=acourdavault >> sonar-scanner.properties
echo sonar.ws.timeout=120 >> sonar-scanner.properties
echo sonar.sources=packages/manager/src/,packages/manager/e2e/,packages/linode-js-sdk/src/ >> sonar-scanner.properties
echo sonar.exclusions=**/public/**,**/*.patch >> sonar-scanner.properties
echo sonar.typescript.tsconfigPath=packages/manager/tsconfig.json >> sonar-scanner.properties
echo sonar.javascript.lcov.reportPaths=packages/manager/output/coverage/jest/lcov.info >> sonar-scanner.properties
echo sonar.coverage.exclusions=**/e2e/**,**/__data__/** >> sonar-scanner.properties
echo sonar.testExecutionReportPaths=packages/manager/test-report.xml >> sonar-scanner.properties
echo sonar.tests=packages/manager/ >> sonar-scanner.properties
echo sonar.test.inclusions=**/*.test.ts,**/src/**/*.test.tsx,**/*.stories.tsx >> sonar-scanner.properties
echo sonar.test.exclusions=**/e2e/**,**/*.spec.js >> sonar-scanner.properties
cat sonar-scanner.properties
docker run --rm -e SONAR_TOKEN=63b59b1379995d0bd89e53c6239396431f96bc51 -e SONAR_HOST_URL=https://sonarcloud.io -v $(pwd)/sonar-scanner.properties:/opt/sonar-scanner/conf/sonar-scanner.properties -v $(pwd):/usr/src sonarsource/sonar-scanner-cli
