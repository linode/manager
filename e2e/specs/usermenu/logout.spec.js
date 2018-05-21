import Page from '../../pageobjects/page';

const { constants } = require('../../constants');
const page = new Page();

describe('Log out Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.linodes);
    });

    it('should log user out', () => {
        page.logout();
    });

    it('should not successfully navigate back to a manager app page', () => {
        browser.url(constants.routes.volumes);
        browser.waitUntil(function() {
            return browser.getUrl().includes('returnTo%253D%252Fvolumes');
        }, 10000);
    });
});