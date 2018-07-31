module.exports = {
  baseURL: 'https://selenium-release.storage.googleapis.com',
  basePath: './e2e/drivers',
  version: '3.13.0',
  drivers: {
    chrome: {
      version: '2.40',
      arch: process.arch,
      baseURL: 'https://chromedriver.storage.googleapis.com'
    },
    ie: {
      version: '3.8.0',
      arch: process.arch,
      baseURL: 'https://selenium-release.storage.googleapis.com'
    },
    firefox: {
      version: '0.21.0',
      arch: process.arch,
      baseURL: 'https://github.com/mozilla/geckodriver/releases/download'
    }
  }
};
