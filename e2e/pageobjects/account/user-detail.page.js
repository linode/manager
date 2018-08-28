const { constants } = require('../../constants');

import Page from '../page';

class UserDetail extends Page {
    get userDetailHeader() { return $('[data-qa-user-detail-header]'); }
    get subHeader() { return $('[data-qa-profile-header]'); }
    get deleteSubHeader() { return $('[data-qa-delete-user-header]'); }
    get deleteButton() { return $('[data-qa-confirm-delete]'); }
    get deleteHelpButton() { return $('[data-qa-help-button]'); }
    get usernameField() { return $('[data-qa-username]'); }
    get emailField() { return $('[data-qa-email]'); }
    get saveButton() { return $('[data-qa-submit]'); }
    get cancelButton() { return $('[data-qa-cancel]'); }

    baseElementsDisplay(owner) {
        this.userDetailHeader.waitForVisible(constants.wait.normal);
        this.subHeader.waitForVisible(constants.wait.normal);

        if (owner) {
            expect(this.deleteHelpButton.isExisting()).toBe(true);
        }

        expect(this.deleteSubHeader.isVisible()).toBe(true);
        expect(this.deleteButton.isExisting()).toBe(true);
        expect(this.usernameField.isVisible()).toBe(true);
        expect(this.emailField.isVisible()).toBe(true);
        expect(this.saveButton.isVisible()).toBe(true);
        expect(this.cancelButton.isVisible()).toBe(true);
    }


    updateUsername(username) {
        this.usernameField.$('input').setValue(username);
        this.saveButton.click();
        this.waitForNotice('User Profile updated successfully', constants.wait.normal);
    }

    deleteUser() {
        this.deleteButton.click();
        this.dialogTitle.waitForText(constants.wait.normal);

        expect(this.dialogTitle.getText()).toBe('Confirm Deletion');
        expect(this.dialogContent.getText()).toContain('will be permanently deleted');
        expect(this.dialogConfirmCancel.isVisible()).toBe(true);
        expect(this.dialogConfirmDelete.isVisible()).toBe(true);

        this.dialogTitle.$('..').$(this.dialogConfirmDelete.selector).click();
        this.waitForNotice('deleted successfully', constants.wait.normal);
        expect(browser.getUrl()).toMatch(/\/users$/);
    }
}

export default new UserDetail();