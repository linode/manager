const { constants} = require('../../../constants');
import { Profile, CreateDrawer } from '../../../pageobjects/profile';

const profile = new Profile();
const tokenCreateDrawer = new CreateDrawer();

describe('View - Personal Access Tokens', () => {
    const timestamp = new Date().getTime();
    const newToken = `[data-qa-table-row="${timestamp}"]`;

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

            expect(tokenCreateDrawer.title.getText()).toBe('Add a Personal Access Token');
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
            const expectedExpiration = 'never';

            tokenCreateDrawer.submit.click();
            const tokenTypes = profile.tokenType.map(t => t.getText().includes('Personal Access Token'));

            expect(tokenTypes).toContain(true);
            expect(browser.waitForVisible(newToken)).toBe(true);
            expect(browser.getText(`${newToken} [data-qa-token-expiry]`)).toBe(expectedExpiration);

        });

        describe('Edit - Personal Access Tokens', () => {
            it('should display edit drawer', () => {
                browser.click(`${newToken} [data-qa-action-menu]`);
                browser.click('[data-qa-action-menu-item="Edit"]');
                
                expect(tokenCreateDrawer.label.waitForVisible()).toBe(true);
                expect(tokenCreateDrawer.title.getText()).toBe('Edit this Personal Access Token');
                expect(tokenCreateDrawer.submit.isVisible()).toBe(true);
                expect(tokenCreateDrawer.cancel.isVisible()).toBe(true);
            });

            it('should update label on edit', () => {
                const updatedSelector = `[data-qa-table-row="${timestamp} updated!"]`;
                browser.waitUntil(function() {
                    tokenCreateDrawer.label.setValue(`${timestamp} updated!`);
                    return tokenCreateDrawer.label.getValue() === `${timestamp} updated!`;
                }, 10000);
                tokenCreateDrawer.submit.click();

                browser.waitForVisible(updatedSelector);
                const updatedLabel = browser.getText(updatedSelector);
                expect(updatedLabel).toBe(updatedLabel);
            });

            it('should close on close icon click', () => {
                
            });
        });

        describe('Revoke Personal Access Tokens', () => {
            it('should display revoke dialog', () => {
                browser.
            });
        });
    });
});