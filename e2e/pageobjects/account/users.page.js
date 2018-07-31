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
    get userRestriction() { $('[data-qa-user-restrction]'); }
    get userActionMenu() { return $('[data-qa-action-menu]'); }
    
    get createDrawerUsername() { return $('[data-qa-create-username] input'); }
    get createDrawerEmail() { return $('[data-qa-create-email] input'); }
    get createDrawerRestricted() { return $('[data-qa-create-restricted]'); }
    get createDrawerSubmit() { return $('[data-qa-submit]'); }
    get createDrawerCancel() { return $('[data-qa-cancel]'); }

    
    baseElementsDisplay() {
        this.usersHeader.waitForVisible(constants.wait.normal);
        expect(this.usersHeader.getText()).toBe('Users');
        expect(this.usernameColumn.isVisible()).toBe(true);
        expect(this.emailColumn.isVisible()).toBe(true);
        expect(this.restrictionColumn.isVisible()).toBe(true);
        expect(this.userRows.length).toBeGreaterThanOrEqual(1);
        expect(this.userRows[0].$(this.username.selector).getText()).toBe(process.env.MANAGER_USER);
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
        }

        this.createDrawerSubmit.click();

        this.drawerTitle.waitForExist(constants.wait.normal, true);
        this.waitForNotice(`User ${userConfig.username} created successfully`);
        this.userRow.waitForVisible(constants.wait.normal);

        if (!userConfig.hasOwnProperty('restricted')) {
            browser.waitUntil(function() {
                return $$('[data-qa-user-row]')
                    .filter(u => u.$('[data-qa-username]').getText() === userConfig.username).length > 0;
            }, constants.wait.normal, 'User failed to display in table');
        }
    }

    delete(userConfig) {
        const userToDelete =
            this.userRows
                .filter(user => user.$(this.username.selector).getText() === userConfig.username);
        
        this.selectActionMenuItem(userToDelete[0], 'Delete');

        this.dialogTitle.waitForText(constants.wait.normal);
        this.dialogConfirmDelete.waitForVisible(constants.wait.normal);
        this.dialogConfirmCancel.waitForVisible(constants.wait.normal);
        this.dialogConfirmDelete.click();
        this.waitForNotice(`User ${userConfig.username} deleted successfully`, constants.wait.normal);
    }

    viewPermisions(userConfig) {

    }

    viewProfile(userConfig) {

    }
}

export default new Users();