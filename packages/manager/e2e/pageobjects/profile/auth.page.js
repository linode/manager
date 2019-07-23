const otplib = require('otplib');
const { constants } = require('../../constants');

import Page from '../page';

export class Auth extends Page {
    get passwordHeader() { return this.pageTitle; }
    get toggleTfa() { return $('[data-qa-toggle-tfa]'); }
    get tfaDescription() { return $('[data-qa-copy]'); }
    get hideShowCode() { return $('[data-qa-hide-show-code]'); }
    get codeTooltip() { return $('[data-qa-copy-tooltip]'); }
    get code() { return $('[data-qa-copy-tooltip] input'); }
    get token() { return $('[data-qa-confirm-token]'); }
    get tokenField() { return $('[data-qa-confirm-token] input'); }
    get confirmToken() { return $(this.submitButton.selector); }
    get cancelToken() { return $(this.cancelButton.selector); }
    get qrCode() { return $('[data-qa-qr-code]'); }

    baseElemsDisplay() {
        this.passwordHeader.waitForVisible(constants.wait.normal);
        expect(this.toggleTfa.isVisible()).toBe(true);
        expect(this.tfaDescription.isVisible()).toBe(true);
        expect(this.tfaDescription.getText()).toMatch(/\w/ig);
    }

    enableTfa(secret) {
        const successMsg = 'Two-factor authentication has been enabled.';
        const validToken = otplib.authenticator.generate(secret);

        this.tokenField.setValue(validToken);
        this.confirmToken.click();
        this.waitForNotice(successMsg, constants.wait.normal);
    }

    disableTfa() {
        const disableMsg = 'Two-factor authentication has been disabled.';

        this.toggleTfa.click();
        this.dialogTitle.waitForVisible(constants.wait.normal);
        expect(this.dialogContent.getText()).toContain('disable two-factor');
        expect(this.cancelToken.isVisible()).toBe(true);
        expect(this.confirmToken.isVisible()).toBe(true);

        this.confirmToken.click();
        this.waitForNotice(disableMsg, constants.wait.normal);
        expect(this.toggleTfa.getAttribute('data-qa-toggle-tfa')).toBe('false');
    }
}

export default new Auth();
