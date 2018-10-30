const { constants } = require('../../constants');

import Profile from '../../pageobjects/profile';
import Auth from '../../pageobjects/profile/auth.page';

describe('Profile - Two Factor Authentication Suite', () => {
    const serviceError = 'Invalid token. Two-factor auth not enabled. Please try again.';

    beforeAll(() => {
        browser.url(constants.routes.profile.auth);
        Profile.profileHeader.waitForVisible(constants.wait.normal);
    });

    it('should display two-factor panel', () => {
        Auth.baseElemsDisplay();
    });

    it('should display QR code and instructions on toggle', () => {
        Auth.toggleTfa.click();

        Auth.qrCode.waitForVisible(constants.wait.normal);

        expect(Auth.token.isVisible()).toBe(true);
        expect(Auth.tokenField.isVisible()).toBe(true);
        expect(Auth.code.getValue().split('').length).toEqual(16);
        expect(Auth.confirmToken.isVisible()).toBe(true);
        expect(Auth.codeTooltip.isVisible()).toBe(true);
        expect(Auth.cancelToken.isVisible()).toBe(true);
    });

    it('should fail to add a token less than 6 characters', () => {
        const badToken = 'asdfasds';
        const errorMsg = '6 characters';

        Auth.tokenField.setValue(badToken);
        Auth.confirmToken.click();

        // Wait for form error to display
        Auth.token.$('p').waitForText(constants.wait.normal);

        browser.waitUntil(function() {
            return Auth.token.$('p').getText().includes(errorMsg);
        }, constants.wait.normal);
    });

    it('should display a service error on submission of an invalid token', () => {
        const invalidToken = '435443';

        Auth.tokenField.setValue(invalidToken);
        Auth.confirmToken.click();

        Auth.waitForNotice(serviceError, constants.wait.normal);
    });

    it('should hide the service error on cancel', () => {
        Auth.cancelToken.click();
        Auth.waitForNotice(serviceError, constants.wait.normal, true);
    });

    it('should hide the qr code', () => {
        Auth.hideShowCode.click();

        expect(Auth.qrCode.isVisible()).toBe(false);
        expect(Auth.tokenField.isVisible()).toBe(false);
        expect(Auth.confirmToken.isVisible()).toBe(false);
        expect(Auth.codeTooltip.isVisible()).toBe(false);
        expect(Auth.cancelToken.isVisible()).toBe(false);
    });

    it('should disable tfa and hide the panel', () => {
        Auth.toggleTfa.click();
        Auth.hideShowCode.waitForVisible(constants.wait.normal, true);
    });
});
