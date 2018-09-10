const { constants } = require('../../constants');

import { axeTest } from '../../utils/accessibility';

describe('Example Accessibility Test', () => {
    beforeAll(() => {
        browser.url(constants.routes.dashboard);
    });

    it('should run an axe-core accessibility test', () => {
        const testResults = axeTest();
        testResults.forEach(res => console.log(res.nodes));
        browser.debug();
    });
});