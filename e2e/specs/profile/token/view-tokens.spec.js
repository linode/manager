const { constants} = require('../../../constants');
import { Profile, CreateDrawer } from '../../../pageobjects/profile';

const profile = new Profile();
const tokenCreateDrawer = new CreateDrawer();

describe('View - Personal Access Tokens', () => {
    const timestamp = new Date().getTime();

    beforeAll(() => {
        browser.url(constants.routes.dashboard);

        // Navigate to Tokens manually, later we'll navigate through the UI
        browser.url('/profile/tokens');
    });

    it('should display base elements', () => {
        profile.tokenBaseElems();
    });

    it('should display tokens', () => {
        const labels = profile.tokenLabel;
        labels.forEach(l => expect(l.isVisible()).toBe(true));
    });

    describe('Create - Personal Access Tokens', () => {
       it('should display create drawer on create', () => {
            profile.createToken();
            tokenCreateDrawer.baseElemsDisplay();
            tokenCreateDrawer.labelTimestamp(timestamp);
         });

        it('should fail to create without updating permissions', () => {
            tokenCreateDrawer.submit.click();

            // const errorMsg = browser.isVisible();
        });

        it('should set basic permissions', () => {
            tokenCreateDrawer.setPermission(tokenCreateDrawer.account, tokenCreateDrawer.readPermission);
            tokenCreateDrawer.setPermission(tokenCreateDrawer.domain, tokenCreateDrawer.nonePermission);
            tokenCreateDrawer.setPermission(tokenCreateDrawer.events, tokenCreateDrawer.rwPermission);
            tokenCreateDrawer.setPermission(tokenCreateDrawer.account, tokenCreateDrawer.rwPermission);
            tokenCreateDrawer.setPermission(tokenCreateDrawer.images, tokenCreateDrawer.rwPermission);
        });

        it('should successfully create personal access token on submit', () => {
            tokenCreateDrawer.submit.click();
            const tokenTypes = profile.tokenType.map(t => t.getText().includes('Personal Access Token'));
            expect(tokenTypes).toContain(true);
            expect(browser.waitForVisible(`[data-qa-token-label="${timestamp}"]`)).toBe(true);
        });
    });

    describe('Edit - Personal Access Tokens', () => {
        
    });
});