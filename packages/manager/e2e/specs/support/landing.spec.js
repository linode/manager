const { constants } = require('../../constants');

import SupportLanding from '../../pageobjects/support/landing.page.js';

describe('Support - Landing Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.support.landing);
    });

    it('should display the support landing page elements', () => {
        SupportLanding.baseElemsDisplay();
    });
});
