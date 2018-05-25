const { constants } = require('../constants');
const { readToken } = require('../utils/config-utils');

import { createGenericLinode } from '../utils/common';

describe('Setup Tests Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-circle-progress]', 15000, true);
    });

    it('should remove all account data', () => {
        const token = readToken();
        browser.deleteAll(token);
    });

    it('should create a generic linode account', () => {
        const testLabel = `${new Date().getTime()}-Test`;
        
        browser.waitUntil(function() {
            browser.refresh();
            browser.waitForVisible('[data-qa-add-new-menu-button]', 15000);
            browser.waitForVisible('[data-qa-circle-progress]', 15000, true);
            
            if (browser.isVisible('[data-qa-placeholder-title]')) {
                return true;
            }

            return false;
        }, 25000);

        createGenericLinode(testLabel);
    });
});
