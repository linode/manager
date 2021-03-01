'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

const envAppVersion = process.env.VERSION;

function ensureSlash(pathVar, needsSlash) {
  const hasSlash = pathVar.endsWith('/');
  if (hasSlash && !needsSlash) {
    return pathVar.substr(pathVar, pathVar.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${pathVar}/`;
  } else {
    return pathVar;
  }
}

const getPublicUrl = (appPackageJson) =>
  envPublicUrl || require(appPackageJson).homepage;

const getAppVersion = (appPackageJson) =>
  envAppVersion || require(appPackageJson).version;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl =
    envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
  return ensureSlash(servedUrl, true);
}

// config after eject: we're in ./config/
const packageJson = resolveApp('package.json');
module.exports = {
  appDirectory,
  dotenv: resolveApp('.env'),
  appBuild: resolveApp('build'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index.tsx'),
  appPackageJson: packageJson,
  appSrc: resolveApp('src'),
  browserMocks: resolveApp('src/mocks/testBrowser.ts'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveApp('src/setupTests.ts'),
  appNodeModules: resolveApp('node_modules'),
  appTsConfig: resolveApp('tsconfig.json'),
  appEsLintConfig: resolveApp('.eslintrc.js'),
  publicUrl: getPublicUrl(packageJson),
  appVersion: getAppVersion(packageJson),
  servedPath: getServedPath(packageJson),
};
