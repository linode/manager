const { constants} = require('../../constants');
import { Profile, OauthCreateDrawer, dialogMap} from '../../pageobjects/profile';

const profile = new Profile();
const createDrawer = new OauthCreateDrawer();

describe('Profile - OAuth Clients Suite', () => {
    const timestamp = new Date().getTime();
    const client = {
        label: `${timestamp} Test Client`,
        callback: 'https://test.com:3000',
        access: 'Public',
    }

    beforeAll(() => {
        browser.url(constants.routes.profile.oauth);
    });

    describe('OAuth Clients - Create Client Suite', () => {
        it('should display create drawer', () => {
            profile.oauthCreate.waitForVisible();
            profile.create('oauth');
        });

        it('should close create drawer on cancel', () => {
            createDrawer.cancel.click();
            browser.waitForVisible('[data-qa-drawer-title]', 10000, true);
        });

        it('should display dialog with secret on submit', () => {
            profile.create('oauth');

            createDrawer.label.setValue(client.label);
            createDrawer.callbackUrl.setValue(client.callback);
            createDrawer.public.click();

            createDrawer.submit.click();
            browser.waitForVisible(dialogMap.dialogTitle);
            const secret = $(dialogMap.dialogContent).$('span').getText();
            expect(secret).not.toBe(null);

            browser.click(dialogMap.closeDialog);
            browser.waitForVisible(dialogMap.dialogTitle, 10000, true);
        });

        it('should display new client in table', () => {
            const newClient = $(`[data-qa-table-row="${client.label}"]`);
            const newClientAccess = newClient.$(profile.oauthAccess.selector);
            const newClientId = newClient.$(profile.oauthId.selector);
            const newClientCallback = newClient.$(profile.oauthCallback.selector);

            expect(newClientAccess.getText()).toBe(client.access);
            expect(newClientId.getText()).not.toBe(null);
            expect(newClientCallback.getText()).toBe(client.callback);
            expect(newClient.isVisible()).toBe(true);
        });
    });

    it('should display base elements', () => {
        profile.oauthBaseElems();
    });
});
