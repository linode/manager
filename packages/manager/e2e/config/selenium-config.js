module.exports = {
  baseURL: 'https://selenium-release.storage.googleapis.com',
  basePath: './e2e/drivers',
  version: '3.141.59',
  drivers: {
    chrome: {
      version: '80.0.3987.106',
      arch: process.arch,
      baseURL: 'https://chromedriver.storage.googleapis.com'
    },
    ie: {
      version: '3.8.0',
      arch: process.arch,
      baseURL: 'https://selenium-release.storage.googleapis.com'
    },
    firefox: {
      version: '0.24.0',
      arch: process.arch,
      baseURL: 'https://github.com/mozilla/geckodriver/releases/download'
    }
  }
};
