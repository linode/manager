const { constants } = require('../constants');
const { readToken } = require('../utils/config-utils');

describe('Setup Tests Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-circle-progress]', constants.wait.normal, true);
    });

    it('should remove all account data', () => {
        const token = readToken(browser.options.testUser);
        browser.deleteAll(token);
    });

    it('should display placeholder message', () => {
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-circle-progress]', constants.wait.normal, true);

        // it should wait for linodes to be removed
        browser.waitUntil(function() {
            browser.refresh();
            browser.waitForVisible('[data-qa-add-new-menu-button]');
            browser.waitForVisible('[data-qa-circle-progress]', constants.wait.normal, true);
            
            try {
                browser.waitForVisible('[data-qa-placeholder-title]', constants.wait.short);
                return true;
            } catch (err) {
                return false;
            }
        }, constants.wait.long, 'linodes failed to be removed');
    });
});
