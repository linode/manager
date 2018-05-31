const { constants } = require('../constants');
const { readToken } = require('../utils/config-utils');

import { createGenericLinode } from '../utils/common';

describe('Setup Tests Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-circle-progress]', constants.wait.normal, true);
    });

    it('should remove all account data', () => {
        const token = readToken();
        browser.deleteAll(token);
    });

    it('should create a generic linode account', () => {
        const testLabel = `${new Date().getTime()}-Test`;
        
        // Wait for all linodes to be removed
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
        }, constants.wait.long);

        createGenericLinode(testLabel);
    });
});
