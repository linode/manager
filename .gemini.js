module.exports = {
    rootUrl: 'http://localhost:3000',

    browsers: {
        chrome: {
            desiredCapabilities: {
                browserName: 'chrome'
            }
        }
    },

    system: {
        plugins: {
            'html-reporter/gemini': {
                enabled: true,
                path: 'gemini-reports',
                defaultView: 'all',
                baseHost: 'http://localhost:3000'
            }
        }
    },
};