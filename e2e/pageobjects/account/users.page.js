const { constants } = require('../../constants');

import Page from '../page.js';

class Users extends Page {

    get usersHeader() { return $('[data-qa-title]'); }
    get usernameColumn() { return $('[data-qa-username-column]'); }
    get emailColumn() { return $('[data-qa-email-column]'); }
    get restrictionColumn() { return $('[data-qa-restriction-column]'); }
    get addUserButton() { return $('[data-qa-icon-text-link="Add a User"]'); }
    
    get userRow() { return $('[data-qa-user-row]'); }
    get userRows() { return $$('[data-qa-user-row]'); }
    get username() { return $('[data-qa-username]'); }
    get userEmail() { return $('[data-qa-user-email]'); }
    get userRestriction() { return $('[data-qa-user-restriction]'); }
    get userActionMenu() { return $('[data-qa-action-menu]'); }
    
    get createDrawerUsername() { return $('[data-qa-create-username] input'); }
    get createDrawerEmail() { return $('[data-qa-create-email] input'); }
    get createDrawerRestricted() { return $('[data-qa-create-restricted]'); }
    get createDrawerSubmit() { return $('[data-qa-submit]'); }
    get createDrawerCancel() { return $('[data-qa-cancel]'); }

    get userDetailHeader() { return $('[data-qa-user-detail-header]'); }
    get userProfileTab() { return $('[data-qa-tab="User Profile"]'); }
    get userPermissionsTab() { return $('[data-qa-tab="User Permissions"]'); }
    get backButton() { return $('[data-qa-back-button]'); }

    
    baseElementsDisplay() {
        this.usersHeader.waitForVisible(constants.wait.normal);
        expect(this.usersHeader.getText()).toBe('Users');
        expect(this.usernameColumn.isVisible()).toBe(true);
        expect(this.emailColumn.isVisible()).toBe(true);
        expect(this.restrictionColumn.isVisible()).toBe(true);
            
        expect(this.addUserButton.isVisible()).toBe(true);
    }

    add(userConfig) {
        this.addUserButton.click();
        this.drawerTitle.waitForText(constants.wait.normal);
        this.notice.waitForVisible(constants.wait.normal);

        this.createDrawerEmail.setValue(userConfig.email);
        this.createDrawerUsername.setValue(userConfig.username);

        if (userConfig.restricted) {
            this.createDrawerRestricted.click();
            browser.waitForExist(`${this.createDrawerRestricted.selector} input:checked`, constants.wait.normal);
        }

        this.createDrawerSubmit.click();

        this.drawerTitle.waitForExist(constants.wait.normal, true);
        this.waitForNotice(`User ${userConfig.username} created successfully`);

        if (!userConfig.hasOwnProperty('restricted')) {
            browser.waitForVisible('[data-qa-user-row]', constants.wait.normal);

            browser.waitUntil(function() {
                return $$('[data-qa-user-row]')
                    .filter(u => u.$('[data-qa-username]').getText() === userConfig.username).length > 0;
            }, constants.wait.normal, 'User failed to display in table');
        } else {
            this.userDetailHeader.waitForVisible(constants.wait.normal);
        }
    }

    delete(userConfig) {
        const user = this.userRow(userConfig.username);
        
        this.selectActionMenuItem(user, 'Delete');

        this.dialogTitle.waitForText(constants.wait.normal);
        this.dialogConfirmDelete.waitForVisible(constants.wait.normal);
        this.dialogConfirmCancel.waitForVisible(constants.wait.normal);
        this.dialogConfirmDelete.click();
        this.waitForNotice(`User ${userConfig.username} deleted successfully`, constants.wait.normal);
    }

    viewPermissions(username) {
        const user = this.userRow(username);
        this.selectActionMenuItem(user, 'User Permissions');
    }

    viewProfile(username) {
        const user = this.userRow(username);
        this.selectActionMenuItem(user, 'User Profile');
    }

    userRow(username) {
        const user = this.userRows
            .filter(user => user.$(this.username.selector).getText() === username);
        return user[0];
    }
}

export default new Users();