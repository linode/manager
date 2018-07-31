const { constants } = require('../../constants');

import Users from '../../pageobjects/account/users.page';

describe('Account - Users Suite', () => {
    const userConfig = {
        username: `test-user${new Date().getTime()}`,
        email: `${process.env.MANAGER_USER}@linode.com`
    }

    beforeAll(() => {
        browser.url(constants.routes.account.users);
    });

    it('should display users page base elements', () => {
        Users.baseElementsDisplay();     
    });

    it('should create a new unrestricted user', () => {
        Users.add(userConfig);
    });

    it('should delete the new unrestricted user', () => {
        Users.delete(userConfig);
    });

    xit('should create a new restricted user', () => {
        
    });
});
