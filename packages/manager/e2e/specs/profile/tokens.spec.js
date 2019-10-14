const { constants } = require('../../constants');

import {
  Profile,
  TokenCreateDrawer,
  dialogMap
} from '../../pageobjects/profile';

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
      /** opens the create drawer */
      profile.create('token');

      tokenCreateDrawer.baseElemsDisplay();
      tokenCreateDrawer.labelTimestamp(timestamp);

      expect(tokenCreateDrawer.title.getText()).toBe(
        'Add Personal Access Token'
      );
    });

    xit('M3-348 - should fail to create without updating permissions', () => {
      tokenCreateDrawer.submit.click();
    });

    it('should set basic scopes', () => {
      tokenCreateDrawer.setPermission(
        tokenCreateDrawer.account,
        tokenCreateDrawer.readPermission
      );
      tokenCreateDrawer.setPermission(
        tokenCreateDrawer.domain,
        tokenCreateDrawer.nonePermission
      );
      tokenCreateDrawer.setPermission(
        tokenCreateDrawer.events,
        tokenCreateDrawer.rwPermission
      );
      tokenCreateDrawer.setPermission(
        tokenCreateDrawer.account,
        tokenCreateDrawer.rwPermission
      );
      tokenCreateDrawer.setPermission(
        tokenCreateDrawer.images,
        tokenCreateDrawer.rwPermission
      );
    });

    it('should successfully create personal access token on submit', () => {
      tokenCreateDrawer.submit.click();

      $(dialogTitle).waitForDisplayed();
      const title = $(dialogTitle).getText();
      const content = $(dialogContent);
      const secret = content.$('[data-qa-notice]').getText();
      expect(title).toBe('Personal Access Token');
      expect(secret).not.toBe(null);
    });

    it('should display new token in table', () => {
      tokenCreateDrawer.closeDialog.click();
      $(newToken).waitForDisplayed();
    });

    it('should display tokens', () => {
      const labels = profile.tokenLabel;
      labels.forEach(l => expect(l.isDisplayed()).toBe(true));
    });

    it('should display token scopes drawer', () => {
      profile.selectActionMenuItem($(newToken), 'View Token Scopes');

      $('[data-qa-row="Account"]').waitForDisplayed(constants.wait.normal);
      $('[data-qa-close-drawer]').waitForDisplayed();

      const accountPermission = $(
        '[data-qa-row="Account"] [data-qa-perm-rw-radio]'
      );
      const domainPermission = $(
        '[data-qa-row="Domains"] [data-qa-perm-none-radio]'
      );
      const eventsPermission = $(
        '[data-qa-row="Events"] [data-qa-perm-rw-radio]'
      );
      const imagesPermission = $(
        '[data-qa-row="Images"] [data-qa-perm-rw-radio]'
      );

      expect(accountPermission.getAttribute('data-qa-perm-rw-radio')).toBe(
        'true'
      );
      expect(domainPermission.getAttribute('data-qa-perm-none-radio')).toBe(
        'true'
      );
      expect(eventsPermission.getAttribute('data-qa-perm-rw-radio')).toBe(
        'true'
      );
      expect(imagesPermission.getAttribute('data-qa-perm-rw-radio')).toBe(
        'true'
      );

      $('[data-qa-close-drawer]').click();
    });

    describe('Edit - Personal Access Tokens', () => {
      it('should display edit drawer', () => {
        $(`${newToken} [data-qa-action-menu]`).waitForDisplayed(
          constants.wait.normal
        );
        profile.selectActionMenuItem($(newToken), 'Rename Token');

        $(tokenCreateDrawer.label.selector).waitForDisplayed(
          constants.wait.normal
        );
        expect(tokenCreateDrawer.title.getText()).toBe(
          'Edit Personal Access Token'
        );
        $(tokenCreateDrawer.submit.selector).waitForDisplayed(
          constants.wait.normal
        );
        $(tokenCreateDrawer.cancel.selector).waitForDisplayed(
          constants.wait.normal
        );
      });

      it('should update label on edit', () => {
        browser.trySetValue('[data-qa-add-label] input', updatedMsg);
        tokenCreateDrawer.submit.click();

        $(updatedSelector).waitForDisplayed();
        const updatedLabel = $(updatedSelector).getText();
        expect(updatedLabel).toContain(updatedMsg);
      });

      xit('should close on close icon click', () => {
        profile.create('token');
        tokenCreateDrawer.cancel.waitForDisplayed();
        tokenCreateDrawer.cancel.click();
        $('[data-qa-drawer-title]').waitForDisplayed(
          constants.wait.normal,
          true
        );
      });
    });

    describe('Revoke Personal Access Tokens', () => {
      const revokeMenu = '[data-qa-action-menu-item="Revoke"]';

      it('should display revoke action menu item', () => {
        $(`${updatedSelector} [data-qa-action-menu]`).waitForDisplayed(
          constants.wait.normal
        );
        browser.jsClick(`${updatedSelector} [data-qa-action-menu]`);
        expect($(revokeMenu).isDisplayed()).toBe(true);
      });

      it('should display revoke dialog', () => {
        browser.jsClick(revokeMenu);
        $(dialogTitle).waitForDisplayed(constants.wait.normal);

        expect($(dialogTitle).getText()).toBe(`Revoking ${updatedMsg}`);
      });

      it('should revoke on remove', () => {
        browser.jsClick(dialogConfirm);
        profile.tokenBaseElems();
        /** we've revoked the token and it should not be visible */
        browser.refresh();
        $(updatedSelector).waitForDisplayed(constants.wait.normal, true);
      });
    });
  });
});
