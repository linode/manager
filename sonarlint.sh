#!/usr/bin/bash
# .sonarcloud.properties is empty, just needed to fool sonarcloud.io
yarn test --coverage --coverageDirectory=output/coverage/jest

sonar-scanner \
  -Dsonar.projectKey=acourdavault_manager \
  -Dsonar.organization=acourdavault \
  -Dsonar.sources=packages/manager/ \
  -Dsonar.sources.inclusions=packages/manager/src/,packages/manager/e2e/,packages/linode-js-sdk/src/ \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.typescript.tsconfigPath=packages/manager/tsconfig.json \
  -Dsonar.javascript.lcov.reportPaths=packages/manager/output/coverage/jest/lcov.info \
  -Dsonar.ws.timeout=120 \
  -Dsonar.exclusions=**/public/**,**/*.patch \
  -Dsonar.test.inclusions=**/*.test.ts,**/src/**/*.test.tsx,**/*.stories.tsx \
  -Dsonar.test.exclusions=**/e2e/**,**/*.spec.js \
  -Dsonar.login=63b59b1379995d0bd89e53c6239396431f96bc51

# sonar-scanner \
#   -Dsonar.projectKey=linode-js-sdk \
#   -Dsonar.organization=acourdavault \
#   -Dsonar.sources=packages/linode-js-sdk/ \
#   -Dsonar.host.url=https://sonarcloud.io \
#   -Dsonar.typescript.tsconfigPath=packages/linode-js-sdk/tsconfig.json \
#   -Dsonar.javascript.lcov.reportPaths=packages/manager/output/coverage/jest/lcov.info \
#   -Dsonar.test.inclusions=**/*.spec.js,**/*.test.ts,**/src/**/*.test.tsx,**/assets/**,**/e2e/** \
#   -Dsonar.login=20ef145e28d6e7a3417ec121b3b1f08c93edf2bb


# sonar-scanner \
#   -Dsonar.projectKey=acourdavault_manager \
#   -Dsonar.organization=acourdavault \
#   -Dsonar.host.url=https://sonarcloud.io \
#   -Dsonar.login=63b59b1379995d0bd89e53c6239396431f96bc51
