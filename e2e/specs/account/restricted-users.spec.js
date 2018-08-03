const { constants } = require('../../constants');

import Users from '../../pageobjects/account/users.page';

describe('Account - Restricted User Suite', () => {

    const userConfig = {
        username: `test-user${new Date().getTime()}`,
        email: `pthiel@linode.com`,
        restricted: true,
    }

    beforeAll(() => {
        browser.url(constants.routes.account.users);
        Users.baseElementsDisplay();
    });

    it('should create a restricted user', () => {
        Users.add(userConfig);
    });

    it('should navigate to user permissions page on creation', () => {
        expect(Users.userPermissionsTab.isVisible()).toBe(true);
        expect(Users.userPermissionsTab.getAttribute('aria-selected')).toBe('true');
        expect(browser.getUrl()).toContain(`/users/${userConfig.username}/permissions`);
    });

    it('should navigate back to user listing on click back arrow', () => {
        Users.backButton.click();
        Users.baseElementsDisplay();

        expect(browser.getUrl()).toBe(`${browser.options.baseUrl}/users`);
    });

    it('should display user as restricted in users table', () => {
       const restrictedUser = Users.userRow(userConfig.username);
       expect(restrictedUser.$(Users.userRestriction.selector).getText()).toMatch(/Restricted/ig);
    });

    it('should view restricted user profile', () => {
        Users.viewProfile(userConfig.username);

        Users.userDetailHeader.waitForVisible(constants.wait.normal);
        expect(Users.userProfileTab.getAttribute('aria-selected')).toBe('true');

        // Navigate back to users listing
        browser.url(constants.routes.account.users);
        Users.baseElementsDisplay();
    });

    it('should view restricted user permissions', () => {
        Users.viewPermissions(userConfig.username);

        Users.userDetailHeader.waitForVisible(constants.wait.normal);
        expect(Users.userPermissionsTab.getAttribute('aria-selected')).toBe('true');

        // Navigate back to users listing
        browser.url(constants.routes.account.users);
        Users.baseElementsDisplay();
    });

    it('should delete the restricted user', () => {
       Users.delete(userConfig); 
    });
});
