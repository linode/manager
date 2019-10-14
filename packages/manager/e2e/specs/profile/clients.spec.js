const { constants } = require('../../constants');
import {
  Profile,
  OauthCreateDrawer,
  dialogMap
} from '../../pageobjects/profile';

const profile = new Profile();
const createDrawer = new OauthCreateDrawer();

xdescribe('Profile - OAuth Clients Suite', () => {
  const timestamp = new Date().getTime();
  const client = {
    label: `${timestamp} Test Client`,
    callback: 'https://test.com:3000',
    access: 'Public'
  };
  const editedClient = {
    label: `${timestamp} Test Client Edit`,
    callback: 'https://test-edit.com:3000',
    access: 'Public'
  };
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
      profile.oauthCreate.waitForDisplayed(constants.wait.normal);
      profile.create('oauth');
    });

    it('should close create drawer on cancel', () => {
      createDrawer.cancel.click();
      $('[data-qa-drawer-title]').waitForDisplayed(constants.wait.normal, true);
    });

    it('should display dialog with secret on submit', () => {
      profile.create('oauth');

      createDrawer.label.setValue(client.label);
      createDrawer.callbackUrl.setValue(client.callback);
      createDrawer.public.click();

      createDrawer.submit.click();
      $(dialogTitle).waitForDisplayed();
      profile.waitForNotice(/\w\d/);

      const secret = $(dialogContent)
        .$('[data-qa-notice]')
        .getText();
      expect(secret).not.toBe(null);

      $(dialogClose).click();
      $(dialogTitle).waitForDisplayed(constants.wait.normal, true);
    });

    it('should display new client in table', () => {
      const newClient = $(`[data-qa-table-row="${client.label}"]`);
      const newClientAccess = newClient.$(profile.oauthAccess.selector);
      const newClientId = newClient.$(profile.oauthId.selector);
      const newClientCallback = newClient.$(profile.oauthCallback.selector);

      expect(newClientAccess.getText()).toBe(client.access);
      expect(newClientId.getText()).not.toBe(null);
      expect(newClientCallback.getText()).toBe(client.callback);
      expect(newClient.isDisplayed()).toBe(true);
    });
  });

  it('should display base elements', () => {
    profile.oauthBaseElems();
  });

  describe('OAuth Clients - Edit', () => {
    it('should display the edit drawer', () => {
      profile.selectActionMenu(client.label, 'Edit');
      createDrawer.label.waitForDisplayed();

      expect(createDrawer.label.isDisplayed()).toBe(true);
      expect(createDrawer.callbackUrl.isDisplayed()).toBe(true);
    });

    it('should display public checkbox as disabled', () => {
      expect(!!createDrawer.public.$('input').getAttribute('disabled')).toBe(
        true
      );
    });

    xit('should update table on edit submit', () => {
      createDrawer.updateLabel(editedClient.label);
      browser.trySetValue(
        createDrawer.callbackUrl.selector,
        editedClient.callback
      );
      createDrawer.submit.click();

      $(editedRow).waitForDisplayed(constants.wait.normal);
      const displayedLabel = $(editedRow)
        .$(profile.oauthLabel.selector)
        .getText();
      const displayedAccess = $(editedRow)
        .$(profile.oauthAccess.selector)
        .getText();
      const displayedCallback = $(editedRow)
        .$(profile.oauthCallback.selector)
        .getText();

      expect(displayedLabel).toBe(editedClient.label);
      expect(displayedAccess).toBe(editedClient.access);
      expect(displayedCallback).toBe(editedClient.callback);
    });
  });

  xdescribe('Oauth Clients - Reset Secret', () => {
    it('should display reset in action panel', () => {
      $(`${editedRow} [data-qa-action-menu]`).click();

      $('[data-qa-action-menu-item]').waitForDisplayed(constants.wait.normal);

      const actionMenuItems = $$('[data-qa-action-menu-item]').map(item =>
        item.getAttribute('data-qa-action-menu-item')
      );

      expect(actionMenuItems).toMatch(/Reset/);
    });

    it('should display the reset dialog', () => {
      browser.refresh();
      $(editedRow).waitForDisplayed();

      profile.selectActionMenu(editedClient.label, 'Reset Secret');
      $(dialogTitle).waitForDisplayed();

      const title = $(dialogTitle).getText();
      const msg = $(dialogContent).getText();
      expect(title).toMatch(/reset/i);
      expect(msg).toMatch(/reset/i);
    });

    it('should close on cancel', () => {
      $(dialogCancel).click();
      $(dialogTitle).waitForDisplayed(constants.wait.normal, true);
    });

    it('should display new secret on reset', () => {
      profile.selectActionMenu(editedClient.label, 'Reset Secret');
      $(dialogTitle).waitForDisplayed(constants.wait.normal);
      $(dialogConfirm).click();

      profile.waitForNotice(/\w\d/, constants.wait.normal);

      browser.waitUntil(function() {
        const successMsg = /here is your client secret/gi;
        return !!$(dialogContent)
          .getText()
          .match(successMsg);
      }, constants.wait.short);
    });
  });

  xdescribe('OAuth Clients - Delete', () => {
    let deleteButton, cancelButton;
    deleteButton = $(dialogConfirm);
    cancelButton = $(dialogCancel);

    beforeAll(() => {
      browser.refresh();
      profile.oauthLabel.waitForDisplayed(constants.wait.normal);
    });

    it('should display delete dialog', () => {
      profile.selectActionMenu(editedClient.label, 'Delete');
      $(dialogTitle).waitForDisplayed();

      const dialogMsg = $(dialogContent).getText();

      expect(dialogMsg).toMatch(/delete/i);
      expect(deleteButton.isDisplayed()).toBe(true);
      expect(cancelButton.isDisplayed()).toBe(true);
    });

    it('should not delete client on cancel', () => {
      cancelButton.click();
      $(dialogTitle).waitForDisplayed(constants.wait.normal, true);

      expect($(editedRow).isDisplayed()).toBe(true);
    });

    it('should delete client on confirm delete', () => {
      profile.delete('oauth', editedClient.label);
    });
  });
});
