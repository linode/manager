exports.browserConf = {
  chrome: {
    browserName: 'chrome',
    maxInstances: 5,
    acceptInsecureCerts: true,
    'goog:chromeOptions': {
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1600,1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36 WebdriverIO'
      ]
    }
  },
  edge: {
    browserName: 'edge',
    acceptInsecureCerts: true,
    os: 'Windows',
    os_version: '10',
    browserName: 'Edge',
    browser_version: 'insider preview',
    resolution: '1440x900',
    'browserstack.local': 'true',
    'browserstack.selenium_version': '3.13.0'
  },
  headlessChrome: {
    browserName: 'chrome',
    maxInstances: 5,
    acceptInsecureCerts: true,
    'goog:chromeOptions': {
      args: [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        'window-size=1920,1080',
        '--allow-running-insecure-content',
        '--ignore-certificate-errors',
        '--disable-dev-shm-usage',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36 WebdriverIO'
      ]
    }
  },
  firefox: {
    browserName: 'firefox',
    marionette: true,
    maxInstances: 5,
    acceptInsecureCerts: true,
    'moz:firefoxOptions': {
      prefs: {
        'general.useragent.override':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:65.0) Gecko/20100101 Firefox/63.0 WebdriverIO'
      }
    }
  },
  firefoxNightly: {
    browserName: 'firefox',
    marionette: true,
    'moz:firefoxOptions': {
      binary: '/Applications/Firefox Nightly.app/Contents/MacOS/firefox-bin',
      prefs: {
        'general.useragent.override':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:65.0) Gecko/20100101 Firefox/63.0 WebdriverIO'
      }
    },
    maxInstances: 5,
    acceptInsecureCerts: true
  },
  headlessFirefox: {
    browserName: 'firefox',
    marionette: true,
    'moz:firefoxOptions': {
      binary: '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
      args: ['-headless'],
      prefs: {
        'general.useragent.override':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:65.0) Gecko/20100101 Firefox/63.0 WebdriverIO'
      }
    },
    maxInstances: 5,
    acceptInsecureCerts: true
  },
  safari: {
    browserName: 'safari',
    'safari.options': {
      acceptInsecureCerts: true
    },
    maxInstances: 1,
    acceptInsecureCerts: true,
    os: 'OS X',
    os_version: 'High Sierra',
    browser: 'Safari',
    browser_version: '11.0',
    resolution: '1600x1200'
  },
  safariPreview: {
    browserName: 'safari',
    'safari.options': {
      technologyPreview: true,
      acceptInsecureCerts: true
    },
    maxInstances: 1
  },
  mobileSafari: {
    browserName: 'safari',
    platformName: 'iOS',
    platformVersion: '11.2',
    deviceName: 'iPhone 8',
    automationName: 'XCUITest',
    maxInstances: 1
  }
};
