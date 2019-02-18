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

            expect(tokenCreateDrawer.title.getText()).toBe('Add Personal Access Token');
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
            const secret = content.$('[data-qa-notice]').getText();
            expect(title).toBe('Personal Access Token');
            expect(secret).not.toBe(null);
        });

        it('should display new token in table', () => {
            tokenCreateDrawer.closeDialog.click();
            const now = new Date();
            const sixMonths = new Date();
            sixMonths.setMonth( now.getMonth() + 6);
            sixMonths.setDate( sixMonths.getDate() - 1);
            expect(browser.waitForVisible(newToken)).toBe(true);
            expect(browser.getText(`${newToken} [data-qa-token-expiry]`)).toContain(sixMonths.toISOString().slice(0,10));
        });

        it('should display tokens', () => {
            const labels = profile.tokenLabel;
            labels.forEach(l => expect(l.isVisible()).toBe(true));
        });

        it('should display token scopes drawer', () => {
            browser.click(`${newToken} [data-qa-action-menu]`);
            browser.click('[data-qa-action-menu-item="View Token Scopes"]');

            browser.waitForVisible('[data-qa-row="Account"]');
            browser.waitForVisible('[data-qa-close-drawer]');

            const accountPermission = $('[data-qa-row="Account"] [data-qa-perm-rw-radio]');
            const domainPermission = $('[data-qa-row="Domains"] [data-qa-perm-none-radio]');
            const eventsPermission = $('[data-qa-row="Events"] [data-qa-perm-rw-radio]');
            const imagesPermission = $('[data-qa-row="Images"] [data-qa-perm-rw-radio]');

            expect(accountPermission.getAttribute('data-qa-perm-rw-radio')).toBe('true');
            expect(domainPermission.getAttribute('data-qa-perm-none-radio')).toBe('true');
            expect(eventsPermission.getAttribute('data-qa-perm-rw-radio')).toBe('true');
            expect(imagesPermission.getAttribute('data-qa-perm-rw-radio')).toBe('true');

            browser.click('[data-qa-close-drawer]');

            browser.waitForVisible('[data-qa-close-drawer]', constants.wait.normal, true);
            browser.waitForExist('[data-qa-drawer]', constants.wait.normal, true);
        });

        describe('Edit - Personal Access Tokens', () => {
            it('should display edit drawer', () => {
                profile.selectActionMenuItem($(newToken), 'Rename Token')

                expect(tokenCreateDrawer.label.waitForVisible()).toBe(true);
                expect(tokenCreateDrawer.title.getText()).toBe('Edit Personal Access Token');
                expect(tokenCreateDrawer.submit.isVisible()).toBe(true);
                expect(tokenCreateDrawer.cancel.isVisible()).toBe(true);
            });

            it('should update label on edit', () => {
                browser.trySetValue('[data-qa-add-label] input', updatedMsg);
                tokenCreateDrawer.submit.click();

                browser.waitForVisible(updatedSelector);
                const updatedLabel = browser.getText(updatedSelector);
                expect(updatedLabel).toContain(updatedMsg);
            });

            it('should close on close icon click', () => {
                profile.create('token');
                tokenCreateDrawer.cancel.waitForVisible();
                tokenCreateDrawer.cancel.click();
                browser.waitForVisible('[data-qa-drawer-title]', constants.wait.normal, true);
            });
        });

        describe('Revoke Personal Access Tokens', () => {
            const revokeMenu = '[data-qa-action-menu-item="Revoke"]';

            it('should display revoke action menu item', () => {
                browser.waitForVisible(`${updatedSelector} [data-qa-action-menu]`, constants.wait.normal);
                browser.click(`${updatedSelector} [data-qa-action-menu]`);
                expect($(revokeMenu).isVisible()).toBe(true);
            });

            it('should display revoke dialog', () => {
                browser.click(revokeMenu);
                browser.waitForVisible(dialogTitle, constants.wait.normal);

                expect($(dialogTitle).getText()).toBe(`Revoking ${updatedMsg}`);
            });

            it('should revoke on remove', () => {
                browser.click(dialogConfirm);
                profile.tokenBaseElems();
                browser.waitForVisible(updatedSelector, constants.wait.long, true);
            });
        });
    });
});
