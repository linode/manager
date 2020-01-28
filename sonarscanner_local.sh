# yarn test --coverage --coverageDirectory=output/coverage/jest

  # -Dsonar.host.url=https://sonarcloud.io \
  # -Dsonar.login=63b59b1379995d0bd89e53c6239396431f96bc51 \
sh 'echo "sonar.projectKey=acourdavault_manager
sonar.organization=acourdavault
sonar.ws.timeout=120
sonar.sources=packages/manager/src/,packages/manager/e2e/,packages/linode-js-sdk/src/
sonar.exclusions=**/public/**,**/*.patch
sonar.typescript.tsconfigPath=packages/manager/tsconfig.json
sonar.javascript.lcov.reportPaths=packages/manager/output/coverage/jest/lcov.info
sonar.coverage.exclusions=**/e2e/**,**/__data__/**
sonar.testExecutionReportPaths=packages/manager/test-report.xml
sonar.tests=packages/manager/
sonar.test.inclusions=**/*.test.ts,**/src/**/*.test.tsx,**/*.stories.tsx
sonar.test.exclusions=**/e2e/**,**/*.spec.js"'

# docker run --name cloudanalyze -e SONAR_TOKEN=63b59b1379995d0bd89e53c6239396431f96bc51 -e SONAR_HOST_URL=https://sonarcloud.io -v $(pwd)/sonar-scanner.properties:/opt/sonar-scanner/conf/sonar-scanner.properties -v $(pwd):/usr/src sonarsource/sonar-scanner-cli

# sonar-scanner \
#   -Dsonar.projectKey=acourdavault_manager \
#   -Dsonar.organization=acourdavault \
#   -Dsonar.host.url=https://sonarcloud.io \
#   -Dsonar.login=63b59b1379995d0bd89e53c6239396431f96bc51 \
#   -Dsonar.ws.timeout=120 \
#   -Dsonar.sources=packages/manager/src/,packages/manager/e2e/,packages/linode-js-sdk/src/ \
#   -Dsonar.exclusions=**/public/**,**/*.patch \
#   -Dsonar.typescript.tsconfigPath=packages/manager/tsconfig.json \
#   -Dsonar.javascript.lcov.reportPaths=packages/manager/output/coverage/jest/lcov.info \
#   -Dsonar.coverage.exclusions=**/e2e/**,**/__data__/** \
#   -Dsonar.testExecutionReportPaths=packages/manager/test-report.xml \
#   -Dsonar.tests=packages/manager/ \
#   -Dsonar.test.inclusions=**/*.test.ts,**/src/**/*.test.tsx,**/*.stories.tsx \
#   -Dsonar.test.exclusions=**/e2e/**,**/*.spec.js