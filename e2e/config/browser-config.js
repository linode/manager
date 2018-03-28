export const browserConf = {
    chrome: {
        browserName: 'chrome',
        maxInstances: 5,
        acceptSslCerts: true,
        acceptInsecureCerts: true,
        chromeOptions: {
        }
    },
    headlessChrome: {
        browserName: 'chrome',
        maxInstances: 5,
        acceptSslCerts: true,
        acceptInsecureCerts: true,
        chromeOptions: {
            args: [
                'headless','no-sandbox','disable-gpu',
                'window-size=1920x1080','--allow-running-insecure-content',
                '--ignore-certificate-errors',
            ]
        }
    },
    firefox: {
        browserName: 'firefox',
        marionette: true,
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
        acceptInsecureCerts: true
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
