const { constants } = require('../../constants');

import UserDetail from '../../pageobjects/account/user-detail.page';
import Users from '../../pageobjects/account/users.page';

describe('Account - User Detail - Username Suite', () => {
    const userConfig = {
        username: `test-user${new Date().getTime()}`,
        email: `pthiel@linode.com`,
    }

    beforeAll(() => {
        browser.url(constants.routes.account.users);
        Users.baseElementsDisplay();
        Users.add(userConfig);
        const userRow = Users.userRow(userConfig.username);
        userRow.$(Users.username.selector).click();
    });

    describe('User Detail - Update Username Suite', () => {
        it('should display user detail page base elements', () => {
            UserDetail.baseElementsDisplay();
        });

        it('should clear username changes on cancel', () => {
            const originalUsername = browser.getText(`${UserDetail.usernameField.selector} input`);
            browser.setValue(`${UserDetail.usernameField.selector} input`, `someTest${new Date().getTime()}`);
            UserDetail.cancelButton.click();
            const updatedUsername = browser.getText(`${UserDetail.usernameField.selector} input`);

            expect(updatedUsername).toBe(originalUsername);
        });

        it('should fail to update username on empty string', () => {
            UserDetail.usernameField.$('input').setValue(' ');
            UserDetail.saveButton.click();
            UserDetail.usernameField.$('p').waitForVisible(constants.wait.normal);
            expect(UserDetail.usernameField.$('p').getText()).toContain('Username may only contain');
            UserDetail.cancelButton.click();
        });

        it('should fail validation on bad username value', () => {
            const badUsername = '$%#5364é-';
            UserDetail.usernameField.$('input').setValue(badUsername);
            UserDetail.saveButton.click();
            UserDetail.usernameField.$('p').waitForVisible(constants.wait.normal);
            expect(UserDetail.usernameField.$('p').getText()).toContain('Username must only use ASCII characters');
            UserDetail.cancelButton.click();
        });

        it('should fail to update when submitting an existing username', () => {
            UserDetail.usernameField.$('input').setValue(process.env.MANAGER_USER);
            UserDetail.saveButton.click();
            UserDetail.usernameField.$('p').waitForVisible(constants.wait.normal);
            expect(UserDetail.usernameField.$('p').getText()).toContain('Username taken');
            UserDetail.cancelButton.click();

        });

        it('should succeed updating with a legitimate username', () => {
            UserDetail.updateUsername(`Test${new Date().getTime()}`);
        });
    });

    describe('User Detail - Remove User Suite', () => {
       it('should display the remove dialog', () => {
            UserDetail.deleteButton.click();
            UserDetail.dialogTitle.waitForVisible(constants.wait.normal);
            UserDetail.dialogConfirmDelete.waitForVisible(constants.wait.normal);
            UserDetail.dialogConfirmCancel.waitForVisible(constants.wait.normal);
        });

        it('should dismiss the dialog on cancel', () => {
            UserDetail.dialogConfirmCancel.click();
            UserDetail.dialogTitle.waitForExist(constants.wait.normal, true);
        }); 

        it('should remove the user', () => {
            UserDetail.deleteUser();
        });
    });
});
