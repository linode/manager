const { constants } = require('../../constants');
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
    const editedClient = {
        label: `${timestamp} Test Client Edit`,
        callback: 'https://test-edit.com:3000',
        access: 'Public',
    }
    const editedRow = `[data-qa-table-row="${editedClient.label}"]`;
    const dialogTitle = dialogMap.title;
    const dialogContent = dialogMap.content;
    const dialogClose = dialogMap.close;
    const dialogCancel = dialogMap.cancel;
    const dialogConfirm = dialogMap.confirm;

    beforeAll(() => {
        browser.url(constants.routes.profile.oauth);
    });

    describe('OAuth Clients - Create Client Suite', () => {
        it('should display create drawer', () => {
            profile.oauthCreate.waitForVisible(constants.wait.normal);
            profile.create('oauth');
        });

        it('should close create drawer on cancel', () => {
            createDrawer.cancel.click();
            browser.waitForVisible('[data-qa-drawer-title]', constants.wait.normal, true);
        });

        it('should display dialog with secret on submit', () => {
            profile.create('oauth');

            createDrawer.label.setValue(client.label);
            createDrawer.callbackUrl.setValue(client.callback);
            createDrawer.public.click();

            createDrawer.submit.click();
            browser.waitForVisible(dialogTitle);
            profile.waitForNotice(/\w\d/);

            const secret = $(dialogContent).$('[data-qa-notice]').getText();
            expect(secret).not.toBe(null);

            browser.click(dialogClose);
            browser.waitForVisible(dialogTitle, constants.wait.normal, true);
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

    describe('OAuth Clients - Edit', () => {
        it('should display the edit drawer', () => {
            profile.selectActionMenu(client.label, "Edit");
            createDrawer.label.waitForVisible();

            expect(createDrawer.label.isVisible()).toBe(true);
            expect(createDrawer.callbackUrl.isVisible()).toBe(true);
        });

        it('should display public checkbox as disabled', () => {
            expect(!!createDrawer.public.$('input').getAttribute('disabled')).toBe(true);
        });

        it('should update table on edit submit', () => {
            createDrawer.updateLabel(editedClient.label);
            browser.trySetValue(createDrawer.callbackUrl.selector, editedClient.callback);
            createDrawer.submit.click();

            browser.waitForVisible(editedRow, constants.wait.normal);
            const displayedLabel = $(editedRow).$(profile.oauthLabel.selector).getText();
            const displayedAccess = $(editedRow).$(profile.oauthAccess.selector).getText();
            const displayedCallback = $(editedRow).$(profile.oauthCallback.selector).getText();

            expect(displayedLabel).toBe(editedClient.label);
            expect(displayedAccess).toBe(editedClient.access);
            expect(displayedCallback).toBe(editedClient.callback);
        });
    });

    describe('Oauth Clients - Reset Secret', () => {
        it('should display reset in action panel', () => {
            browser.click(`${editedRow} [data-qa-action-menu]`);

            browser.waitForVisible('[data-qa-action-menu-item]', constants.wait.normal);

            const actionMenuItems = $$('[data-qa-action-menu-item]')
                .map(item => item.getAttribute('data-qa-action-menu-item'));

            expect(actionMenuItems).toMatch(/Reset/);
        });

        it('should display the reset dialog', () => {
            browser.refresh();
            browser.waitForVisible(editedRow);

            profile.selectActionMenu(editedClient.label, 'Reset Secret');
            browser.waitForVisible(dialogTitle);

            const title = $(dialogTitle).getText();
            const msg = $(dialogContent).getText();
            expect(title).toMatch(/reset/i);
            expect(msg).toMatch(/reset/i);
        });

        it('should close on cancel', () => {
            browser.click(dialogCancel);
            browser.waitForVisible(dialogTitle, constants.wait.normal, true);
        });

        it('should display new secret on reset', () => {
            profile.selectActionMenu(editedClient.label, 'Reset Secret');
            browser.waitForVisible(dialogTitle, constants.wait.normal);
            $(dialogConfirm).click();

            profile.waitForNotice(/\w\d/, constants.wait.normal);

            const content = $(dialogContent).getText();
            expect(content).toContain('Here is your client secret! Store it securely, as it won\'t be shown again.');
        });
    });

    describe('OAuth Clients - Delete', () => {
        let deleteButton, cancelButton;

        beforeAll(() => {
            browser.refresh()
            profile.oauthLabel.waitForVisible(constants.wait.normal);
        });

        it('should display delete dialog', () => {
            profile.selectActionMenu(editedClient.label, "Delete");
            browser.waitForVisible(dialogTitle);
            
            const dialogMsg = $(dialogContent).getText();
            deleteButton = $(dialogConfirm);
            cancelButton = $(dialogCancel);
            
            expect(dialogMsg).toMatch(/delete/i);
            expect(deleteButton.isVisible()).toBe(true);
            expect(cancelButton.isVisible()).toBe(true);
        });

        it('should not delete client on cancel', () => {
            cancelButton.click();
            browser.waitForVisible(dialogTitle, constants.wait.normal, true);

            expect($(editedRow).isVisible()).toBe(true);
        });

        it('should delete client on confirm delete', () => {
            profile.delete('oauth', editedClient.label);
        });
    });
});
