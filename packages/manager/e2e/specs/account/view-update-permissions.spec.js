const { constants } = require('../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../utils/common';
import Users from '../../pageobjects/account/users.page';
import Permissions from '../../pageobjects/account/permissions.page';

describe('Account - Restricted User - Permissions Suite', () => {
    const userConfig = {
        username: `test-user${new Date().getTime()}`,
        email: `pthiel@linode.com`,
        restricted: true,
    }

    let linode;

    beforeAll(() => {
        linode = apiCreateLinode();
        browser.url(constants.routes.account.users);
        Users.baseElementsDisplay();
        Users.add(userConfig);
    });

    afterAll(() => {
        browser.url(constants.routes.account.users);
        Users.baseElementsDisplay();
        Users.delete(userConfig);
        apiDeleteAllLinodes();
    });

    it('should display permissions page', () => {
        expect(Users.userPermissionsTab.getAttribute('aria-selected')).toBe('true');
        Permissions.baseElementsDisplay(true);
    });

    it('should update the add linodes global permission', () => {
        Permissions.toggleGlobalPermission('add_linodes', 'allow');
    });

    it('should update billing access to read only', () => {
        Permissions.setBillingPermission('Read Only');
    });

    it('should update an entity-based specific grant', () => {
        Permissions.setSpecificPermission('Linodes', linode.label, 'Read Only');
    });
});
