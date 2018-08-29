exports.browserConf = {
    chrome: {
        browserName: 'chrome',
        maxInstances: 5,
        acceptSslCerts: true,
        acceptInsecureCerts: true,
        chromeOptions: {
            args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1600,1080',
            ]
        },
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '68.0',
        'resolution': '1440x900',
    },
    edge: {
        'browserName': 'edge',
        'acceptSslCerts': true,
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '17.0',
        'resolution': '1440x900'
    },
    headlessChrome: {
        browserName: 'chrome',
        maxInstances: 5,
        acceptSslCerts: true,
        acceptInsecureCerts: true,
        chromeOptions: {
            args: [
                '--headless','--no-sandbox','--disable-gpu',
                'window-size=1920,1080','--allow-running-insecure-content',
                '--ignore-certificate-errors','--disable-dev-shm-usage',
            ]
        }
    },
    firefox: {
        browserName: 'firefox',
        marionette: true,
        maxInstances: 5,
        acceptInsecureCerts: true
    },

    firefoxNightly: {
        browserName: 'firefox',
        marionette: true,
         'moz:firefoxOptions' : {
            'binary': '/Applications/Firefox Nightly.app/Contents/MacOS/firefox-bin'
        },
        maxInstances: 5,
        acceptInsecureCerts: true
    },
    headlessFirefox: {
        browserName: 'firefox',
        marionette: true,
        'moz:firefoxOptions' : {
            'binary': '/Applications/Firefox Nightly.app/Contents/MacOS/firefox-bin',
            'args': ['-headless']
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
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11.0',
        'resolution': '1600x1200'
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
}
