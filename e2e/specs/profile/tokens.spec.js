const { constants} = require('../../constants');
import { Profile, TokenCreateDrawer, dialogMap } from '../../pageobjects/profile';

const profile = new Profile();
const tokenCreateDrawer = new TokenCreateDrawer();

describe('View - Personal Access Tokens', () => {
    const timestamp = new Date().getTime();
    const dialogTitle = dialogMap.title;
    const dialogContent = dialogMap.content;
    const dialogConfirm = dialogMap.confirm;
    const newToken = `[data-qa-table-row="${timestamp}"]`;
    const updatedSelector = `[data-qa-table-row="${timestamp} updated!"]`;
    const updatedMsg = `${timestamp} updated!`;

    beforeAll(() => {
        browser.url(constants.routes.profile.tokens);
    });

    it('should display base elements', () => {
        profile.tokenBaseElems();
    });

    describe('Create - Personal Access Tokens', () => {
       it('should display create drawer on create', () => {
            profile.create('token');
            tokenCreateDrawer.baseElemsDisplay();
            tokenCreateDrawer.labelTimestamp(timestamp);

            expect(tokenCreateDrawer.title.getText()).toBe('Add a Personal Access Token');
         });

        xit('M3-348 - should fail to create without updating permissions', () => {
            tokenCreateDrawer.submit.click();
        });

        it('should set basic scopes', () => {
            tokenCreateDrawer.setPermission(tokenCreateDrawer.account, tokenCreateDrawer.readPermission);
            tokenCreateDrawer.setPermission(tokenCreateDrawer.domain, tokenCreateDrawer.nonePermission);
            tokenCreateDrawer.setPermission(tokenCreateDrawer.events, tokenCreateDrawer.rwPermission);
            tokenCreateDrawer.setPermission(tokenCreateDrawer.account, tokenCreateDrawer.rwPermission);
            tokenCreateDrawer.setPermission(tokenCreateDrawer.images, tokenCreateDrawer.rwPermission);
        });

        it('should successfully create personal access token on submit', () => {
            tokenCreateDrawer.submit.click();

            browser.waitForVisible(dialogTitle);
            const title = $(dialogTitle).getText();
            const content = $(dialogContent);
            const secret = content.$('span').getText();
            expect(title).toBe('Personal Access Token');
            expect(secret).not.toBe(null);
        });

        it('should display new token in table', () => {
            tokenCreateDrawer.closeDialog.click();
            const expectedExpiration = 'in 6 months';
            expect(browser.waitForVisible(newToken)).toBe(true);
            expect(browser.getText(`${newToken} [data-qa-token-expiry]`)).toBe(expectedExpiration);
            expect($(`${newToken} [data-qa-token-type]`).getText()).toBe('Personal Access Token');

        });

        it('should display tokens', () => {
            const labels = profile.tokenLabel;
            labels.forEach(l => expect(l.isVisible()).toBe(true));
        });

        it('should display token scopes drawer', () => {
            browser.click(`${newToken} [data-qa-action-menu]`);
            browser.click('[data-qa-action-menu-item="View Token Scopes"]');

            browser.waitForVisible('[data-qa-row="Account"]');

            const accountPermission = $('[data-qa-row="Account"] [data-qa-perm-rw-radio]');
            const domainPermission = $('[data-qa-row="Domains"] [data-qa-perm-none-radio]');
            const eventsPermission = $('[data-qa-row="Events"] [data-qa-perm-rw-radio]');
            const imagesPermission = $('[data-qa-row="Images"] [data-qa-perm-rw-radio]');

            expect(accountPermission.getAttribute('class').includes('checked')).toBe(true);
            expect(domainPermission.getAttribute('class').includes('checked')).toBe(true);
            expect(eventsPermission.getAttribute('class').includes('checked')).toBe(true);
            expect(imagesPermission.getAttribute('class').includes('checked')).toBe(true);
            browser.click('[data-qa-close-drawer]');
            browser.waitForVisible('[data-qa-close-drawer]', 5000, true);
        });

        describe('Edit - Personal Access Tokens', () => {
            it('should display edit drawer', () => {
                browser.jsClick(`${newToken} [data-qa-action-menu]`);
                browser.click('[data-qa-action-menu-item="Edit"]');
                
                expect(tokenCreateDrawer.label.waitForVisible()).toBe(true);
                expect(tokenCreateDrawer.title.getText()).toBe('Edit this Personal Access Token');
                expect(tokenCreateDrawer.submit.isVisible()).toBe(true);
                expect(tokenCreateDrawer.cancel.isVisible()).toBe(true);
            });

            it('should update label on edit', () => {
                // Hack needed to edit a label
                browser.waitUntil(function() {
                    try {
                        tokenCreateDrawer.label.click();
                        tokenCreateDrawer.label.clearElement();
                        tokenCreateDrawer.label.setValue(updatedMsg);
                        return tokenCreateDrawer.label.getValue() === updatedMsg;
                    } catch (err) {
                        return false;
                    }
                }, 15000);
                tokenCreateDrawer.submit.click();

                browser.waitForVisible(updatedSelector);
                const updatedLabel = browser.getText(updatedSelector);
                expect(updatedLabel).toContain(updatedMsg);
            });

            it('should close on close icon click', () => {
                profile.create('token');
                tokenCreateDrawer.cancel.click();
                browser.waitForVisible('[data-qa-drawer-title]', 10000, true);
            });
        });

        describe('Revoke Personal Access Tokens', () => {
            const revokeMenu = '[data-qa-action-menu-item="Revoke"]';

            it('should display revoke action menu item', () => {
                browser.waitForVisible('[data-qa-action-menu]');
                browser.click(`${updatedSelector} [data-qa-action-menu]`);
                expect($(revokeMenu).isVisible()).toBe(true);
            });

            it('should display revoke dialog', () => {
                browser.click(revokeMenu);
                browser.waitForVisible(dialogTitle);

                expect($(dialogTitle).getText()).toBe(`Revoking ${updatedMsg}`);
            });

            it('should revoke on remove', () => {
                browser.click(dialogConfirm);
                browser.waitForVisible(updatedSelector, 10000, true);
            });
        });
    });
});
