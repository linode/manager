const { constants } = require('../../constants');

import Lish from '../../pageobjects/profile/lish.page';

describe('Profile - Lish SSH Key Suite', () => {
    const successMsg = 'LISH authentication settings have been updated.';
    const validPublicKey = constants.testPublicKey;

    beforeAll(() => {
        browser.url(constants.routes.profile.lish);
    });

    it('should display the lish authentication methods', () => {
        Lish.baseElemsDisplay();
    });

    it('should disable lish', () => {
        Lish.disable(successMsg);
    });

    it('should update to key only, and fail to save a bad ssh key', () => {
        const invalidPublicKey = 'badKey!';
        const failureMsg = 'SSH Key 1 key-type must be ssh-dss, ssh-rsa, ecdsa-sha2-nistp, or ssh-ed25519.';

        Lish.allowKeyAuthOnly(invalidPublicKey, failureMsg);
    });

    it('should display an additional ssh key field ', () => {
        Lish.addSshKey.click();

        browser.waitUntil(function() {
            return $$(Lish.sshKey.selector).length === 2;
        }, constants.wait.normal);
    });

    it('should remove the additional ssh key field', () => {
        $$(Lish.removeButton.selector)[1].click();
        
        browser.waitUntil(function() {
            return $$(Lish.sshKey.selector).length === 1;
        }, constants.wait.normal);
    });

    it('should accept ssh key only with a valid ssh key', () => {
        Lish.allowKeyAuthOnly(validPublicKey, successMsg);
    });

    it('should update to allow password and ssh key authentication', () => {
        Lish.allowPassAndKey(validPublicKey, successMsg);
    });
});
