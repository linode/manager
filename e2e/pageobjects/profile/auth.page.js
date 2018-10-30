const { constants } = require('../../constants');

import Page from '../page';

export class Auth extends Page {
    get passwordHeader() { return $('[data-qa-title]'); }
    get toggleTfa() { return $('[data-qa-toggle-tfa]'); }
    get tfaDescription() { return $('[data-qa-copy]'); }
    get hideShowCode() { return $('[data-qa-hide-show-code]'); }
    get codeTooltip() { return $('[data-qa-copy-tooltip]'); }
    get code() { return $('[data-qa-copy-tooltip] input'); }
    get token() { return $('[data-qa-confirm-token]'); }
    get tokenField() { return $('[data-qa-confirm-token] input'); }
    get confirmToken() { return $('[data-qa-submit]'); }
    get cancelToken() { return $('[data-qa-cancel]'); }
    get qrCode() { return $('[data-qa-qr-code]'); }

    baseElemsDisplay() {
        this.passwordHeader.waitForVisible(constants.wait.normal);
        expect(this.toggleTfa.isVisible()).toBe(true);
        expect(this.tfaDescription.isVisible()).toBe(true);
        expect(this.tfaDescription.getText()).toMatch(/\w/ig);
    }
}

export default new Auth();
