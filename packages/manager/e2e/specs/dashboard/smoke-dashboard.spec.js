const { constants } = require('../../constants');

import Dashboard from '../../pageobjects/dashboard.page';

describe('Dashboard Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.dashboard);
    });

    it('should display the dashboard elements', () => {
        Dashboard.baseElemsDisplay();
    });

    it('should display blog posts', () => {
        Dashboard.blogCard.waitForVisible(constants.wait.normal);
        expect(Dashboard.blogPosts.length).toBeGreaterThan(0);
        expect(Dashboard.blogPosts.length).toEqual($$(Dashboard.postDescription.selector).length);

        Dashboard.blogPosts.forEach(post => {
            expect(post.getAttribute('href')).toContain('https://blog.linode.com');
        });
    });
});
