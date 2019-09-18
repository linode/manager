const { constants } = require('../constants');
const { assertLog } = require('../utils/assertionLog');

import Page from './page';

export const dialogMap = {
  title: '[data-qa-dialog-title]',
  content: '[data-qa-dialog-content]',
  close: '[data-qa-close-dialog]',
  cancel: '[data-qa-button-cancel]',
  confirm: '[data-qa-button-confirm]'
};

export class OauthCreateDrawer extends Page {
  get title() {
    return $('[data-qa-drawer-title]');
  }
  get label() {
    return $('[data-qa-add-label] input');
  }
  get submit() {
    return $(this.submitButton.selector);
  }
  get cancel() {
    return $(this.cancelButton.selector);
  }
  get callbackUrl() {
    return $('[data-qa-callback] input');
  }
  get public() {
    return $('[data-qa-public]');
  }

  updateLabel(updateMsg) {
    const labelField = this.label;
    // Hack needed to edit a label
    browser.waitUntil(function() {
      try {
        labelField.clearElement();
        labelField.setValue(updateMsg);
        return labelField.getValue() === updateMsg;
      } catch (err) {
        return false;
      }
    }, constants.wait.normal);
  }
}

export class TokenCreateDrawer extends Page {
  get title() {
    return $('[data-qa-drawer-title]');
  }
  get accessColumn() {
    return $$('[data-qa-perm-access]');
  }
  get noneColumn() {
    return $('[data-qa-perm-none]');
  }
  get readColumn() {
    return $('[data-qa-perm-read]');
  }
  get rwColumn() {
    return $('[data-qa-perm-rw]');
  }
  get label() {
    return $('[data-qa-add-label] input');
  }

  get account() {
    return $('[data-qa-row="Account"]');
  }
  get domain() {
    return $('[data-qa-row="Domains"]');
  }
  get events() {
    return $('[data-qa-row="Events"]');
  }
  get images() {
    return $('[data-qa-row="Images"]');
  }
  get ips() {
    return $('[data-qa-row="IPs"]');
  }
  get linodes() {
    return $('[data-qa-row="IPs"]');
  }
  get longview() {
    return $('[data-qa-row="Longview"]');
  }
  get nodebalancers() {
    return $('[data-qa-row="NodeBalancers"]');
  }
  get stackscripts() {
    return $('[data-qa-row="StackScripts"]');
  }
  get volumes() {
    return $('[data-qa-row="Volumes"]');
  }

  // get expiry() { return $('[data-qa-token-expiry]'); }
  get nonePermission() {
    return $('[data-qa-perm-none-radio]');
  }
  get readPermission() {
    return $('[data-qa-perm-read-radio]');
  }
  get rwPermission() {
    return $('[data-qa-perm-rw-radio]');
  }

  get submit() {
    return $(this.submitButton.selector);
  }
  get cancel() {
    return $(this.cancelButton.selector);
  }
  get closeDialog() {
    return $('[data-qa-close-dialog]');
  }

  baseElemsDisplay() {
    expect(this.noneColumn.isDisplayed())
      .withContext(
        `"${this.noneColumn.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.readColumn.isDisplayed())
      .withContext(
        `"${this.readColumn.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.rwColumn.isDisplayed())
      .withContext(
        `"${this.rwColumn.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.label.isDisplayed())
      .withContext(`"${this.label.selector}" selector ${assertLog.displayed}`)
      .toBe(true);

    expect(this.account.isDisplayed())
      .withContext(`"${this.account.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.domain.isDisplayed())
      .withContext(`"${this.domain.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.events.isDisplayed())
      .withContext(`"${this.events.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.images.isDisplayed())
      .withContext(`"${this.images.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.ips.isDisplayed())
      .withContext(`"${this.ips.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.linodes.isDisplayed())
      .withContext(`"${this.linodes.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.longview.isDisplayed())
      .withContext(
        `"${this.longview.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.nodebalancers.isDisplayed())
      .withContext(
        `"${this.nodebalancers.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.stackscripts.isDisplayed())
      .withContext(
        `"${this.stackscripts.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.volumes.isDisplayed())
      .withContext(`"${this.volumes.selector}" selector ${assertLog.displayed}`)
      .toBe(true);

    expect(this.nonePermission.isDisplayed())
      .withContext(
        `"${this.nonePermission.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.readPermission.isDisplayed())
      .withContext(
        `"${this.readPermission.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.rwPermission.isDisplayed())
      .withContext(
        `"${this.rwPermission.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.submit.isDisplayed())
      .withContext(`"${this.submit.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.cancel.isDisplayed())
      .withContext(`"${this.cancel.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
  }

  labelTimestamp(time) {
    this.label.setValue(time);
    this.accessColumn.forEach(col =>
      expect(col.isDisplayed())
        .withContext(`"${this.col}" selector ${assertLog.displayed}`)
        .toBe(true)
    );
  }

  setPermission(row, permission) {
    const elem = row.$(permission.selector);
    elem.click();
    expect(elem.getAttribute('data-qa-radio'))
      .withContext(
        `${assertLog.incorrectAttr} "${this.elem.selector}" selector`
      )
      .toBe('true');
  }
}

export class Profile extends Page {
  get profileHeader() {
    return $('[data-qa-profile-header]');
  }
  get apiTokensTab() {
    return $('[data-qa-tab="API Tokens"]');
  }

  // TODO Need to unify internal & external usage of 'OAuth Clients'/'My Apps'.
  // Currently in the context of profile, the term 'Oauth Client(s)' is referred to as 'app' or 'My Apps' for user-facing displays.
  get oauthClientsTab() {
    return $('[data-qa-tab="OAuth Apps"]');
  }
  get tableHeader() {
    return $$('[data-qa-table]');
  }
  get tableHead() {
    return $$('[data-qa-table-head]');
  }
  get tableRow() {
    return $$('[data-qa-table-row]');
  }

  get passwordTab() {
    return $('[data-qa-tab="Password & Authentication"]');
  }

  get tokenLabel() {
    return $$('[data-qa-token-label]');
  }
  get tokenType() {
    return $$('[data-qa-token-type]');
  }
  get tokenCreated() {
    return $('[data-qa-token-created]');
  }
  get tokenExpires() {
    return $('[data-qa-token-expiry]');
  }
  get tokenActionMenu() {
    return $('[data-qa-action-menu]');
  }
  get tokenCreate() {
    return this.addIcon('Add a Personal Access Token');
  }

  get oauthLabel() {
    return $('[data-qa-oauth-label]');
  }
  get oauthAccess() {
    return $('[data-qa-oauth-access]');
  }
  get oauthId() {
    return $('[data-qa-oauth-id]');
  }
  get oauthCallback() {
    return $('[data-qa-oauth-callback]');
  }
  get oauthActionMenu() {
    return $('[data-qa-action-menu]');
  }
  get oauthCreate() {
    return this.addIcon('Create OAuth App');
  }

  tokenBaseElems() {
    $('[data-qa-profile-header]').waitForDisplayed(constants.wait.normal);
    $('[data-qa-tabs] [data-qa-tab="API Tokens"]').waitForDisplayed(
      constants.wait.normal
    );
    expect(this.profileHeader.isDisplayed())
      .withContext(
        `"${this.profileHeader.selector} selector ${assertLog.displayed}`
      )
      .toBe(true);
    this.tokenCreate.waitForDisplayed(constants.wait.normal);
    expect(this.tableHeader.length)
      .withContext(`"${this.tableHeader.selector}" selector`)
      .toBe(2);
    expect(this.tableHead.length)
      .withContext(
        `${assertLog.incorrectNum} for "${this.tableHead.selector}" selector`
      )
      .toBe(2);
  }

  oauthBaseElems() {
    $('[data-qa-profile-header]').waitForDisplayed(constants.wait.normal);
    expect(this.profileTab('OAuth Apps').getAttribute('aria-selected'))
      .withContext(
        `"${this.profileTab.selector}" selector ${assertLog.incorrectAttr} `
      )
      .toBe('true');
    browser.waitForDisplayed('[data-qa-oauth-label]', constants.wait.normal);
    expect(this.oauthLabel.isDisplayed())
      .withContext(
        `"${this.oauthLabel.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.oauthAccess.isDisplayed())
      .withContext(
        `"${this.oauthAccess.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.oauthId.isDisplayed())
      .withContext(`"${this.oauthId.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.oauthActionMenu.isDisplayed())
      .withContext(
        `"${this.oauthActionMenu.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.oauthCreate.isDisplayed())
      .withContext(
        `"${this.oauthCreate.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
  }

  create(type) {
    if (type === 'oauth') {
      this.oauthCreate.waitForDisplayed(constants.wait.normal);
      this.oauthCreate.click();
    }
    if (type === 'token') {
      this.tokenCreate.waitForDisplayed(constants.wait.normal);
      this.tokenCreate.click();
    }
    $('[data-qa-drawer-title]').waitForText(constants.wait.normal);
    $('[data-qa-add-label]').waitForDisplayed(constants.wait.normal);
  }

  selectActionMenu(row, item) {
    $(`[data-qa-table-row="${row}"] [data-qa-action-menu]`).click();
    $('[data-qa-action-menu-item]').waitForDisplayed(constants.wait.normal);
    $(`[data-qa-action-menu-item="${item}"]`).click();
  }

  delete(type, row) {
    if (type === 'oauth') {
      this.selectActionMenu(row, 'Delete');
      $(dialogMap.title).waitForDisplayed(constants.wait.normal);

      const deleteButton = $(dialogMap.confirm);
      deleteButton.click();

      $(`[data-qa-table-row="${row}"]`).waitForDisplayed(
        constants.wait.normal,
        true
      );
    }

    if (type == 'token') {
    }
  }

  profileTab(tabText) {
    return $$('[data-qa-tabs] a').find(tab => tab.getText() === tabText);
  }
}
