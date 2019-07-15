const { constants } = require('../../constants');

import Page from '../page';

export class Lish extends Page {
    get authModeSelect() { return $('[data-qa-mode-select]'); }
    get sshKey() { return $('[data-qa-public-key] textarea' ); }
    get addSshKey() { return this.addIcon('Add SSH Public Key'); }
    get removeButton() { return $('[data-qa-remove]'); }
    get saveButton() { return $('[data-qa-save]'); }
    get passwordKeysOption() { return $('[data-qa-option="password_keys"]'); }
    get keysOnlyOption() { return $('[data-qa-option="keys_only"]'); }
    get disableLishOption() { return $('[data-qa-option="disabled"]'); }

    baseElemsDisplay() {
        this.authModeSelect.waitForVisible(constants.wait.normal);
        expect(this.sshKey.isVisible()).toBe(true);
        expect(this.removeButton.isVisible()).toBe(true);
        expect(this.saveButton.isVisible()).toBe(true);
        expect(this.authModeSelect.isVisible()).toBe(true);
    }


    disable(statusMsg) {
        this.authModeSelect.$('input').setValue('\uE015');
        this.disableLishOption.waitForVisible(constants.wait.normal);
        this.disableLishOption.click();
        this.disableLishOption.waitForExist(constants.wait.normal, true);
        this.saveButton.click();
        this.waitForNotice(statusMsg, constants.wait.normal);
    }

    allowKeyAuthOnly(publicKey,statusMsg) {
        this.authModeSelect.$('input').setValue('\uE015');
        this.keysOnlyOption.waitForVisible(constants.wait.normal);
        this.keysOnlyOption.click();
        this.keysOnlyOption.waitForExist(constants.wait.normal, true);
        this.sshKey.setValue(publicKey);
        this.saveButton.click();
        this.waitForNotice(statusMsg, constants.wait.normal);
    }

    allowPassAndKey(publicKey,statusMsg) {
        this.authModeSelect.$('input').setValue('\uE015');
        this.passwordKeysOption.waitForVisible(constants.wait.normal);
        this.passwordKeysOption.click();
        this.passwordKeysOption.waitForExist(constants.wait.normal, true);
        this.sshKey.setValue(publicKey);
        this.saveButton.click();
        this.waitForNotice(statusMsg, constants.wait.normal);
    }
}

export default new Lish();
