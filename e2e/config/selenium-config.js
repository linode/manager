module.exports = {
  baseURL: 'https://selenium-release.storage.googleapis.com',
  basePath: './e2e/drivers',
  version: '3.4.0',
  drivers: {
    chrome: {
      version: '2.36',
      arch: process.arch,
      baseURL: 'https://chromedriver.storage.googleapis.com'
    },
    ie: {
      version: '3.8.1',
      arch: process.arch,
      baseURL: 'https://selenium-release.storage.googleapis.com'
    },
    firefox: {
      version: '0.19.1',
      arch: process.arch,
      baseURL: 'https://github.com/mozilla/geckodriver/releases/download'
    }
  }
};
