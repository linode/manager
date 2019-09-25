const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page.js';

class Users extends Page {
  get usersHeader() {
    return this.pageTitle;
  }
  get usernameColumn() {
    return $('[data-qa-username-column]');
  }
  get emailColumn() {
    return $('[data-qa-email-column]');
  }
  get restrictionColumn() {
    return $('[data-qa-restriction-column]');
  }
  get addUserButton() {
    return this.addIcon('Add a User');
  }

  get userRow() {
    return $('[data-qa-user-row]');
  }
  get userRows() {
    return $$('[data-qa-user-row]');
  }
  get username() {
    return $('[data-qa-username]');
  }
  get userEmail() {
    return $('[data-qa-user-email]');
  }
  get userRestriction() {
    return $('[data-qa-user-restriction]');
  }
  get userActionMenu() {
    return $('[data-qa-action-menu]');
  }

  get createDrawerUsername() {
    return $('[data-qa-create-username] input');
  }
  get createDrawerEmail() {
    return $('[data-qa-create-email] input');
  }
  get createDrawerRestricted() {
    return $('[data-qa-create-restricted]');
  }
  get createDrawerSubmit() {
    return this.submitButton;
  }
  get createDrawerCancel() {
    return this.cancelButton;
  }

  get userDetailHeader() {
    return this.breadCrumbLinkText;
  }
  get userProfileTab() {
    return $('[data-qa-tab="User Profile"]');
  }
  get userPermissionsTab() {
    return $('[data-qa-tab="User Permissions"]');
  }

  baseElementsDisplay() {
    this.usersHeader.waitForDisplayed(constants.wait.normal);
    expect(this.usersHeader.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.usersHeader.selector}" selector`
      )
      .toBe('Users');
    expect(this.usernameColumn.isDisplayed())
      .withContext(
        `"${this.usernameColumn.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.emailColumn.isDisplayed())
      .withContext(
        `"${this.emailColumn.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.restrictionColumn.isDisplayed())
      .withContext(
        `"${this.restrictionColumn.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);

    expect(this.addUserButton.isDisplayed())
      .withContext(
        `"${this.addUserButton.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
  }

  add(userConfig) {
    this.addUserButton.waitForDisplayed(constants.wait.normal);
    this.addUserButton.click();
    this.drawerTitle.waitForText(constants.wait.normal);
    this.notice.waitForDisplayed(constants.wait.normal);
    this.createDrawerEmail.setValue(userConfig.email);
    this.createDrawerUsername.setValue(userConfig.username);

    if (userConfig.restricted) {
      this.createDrawerRestricted.click();
      const selector = this.toggleOption.selector;
      const attribute = selector.substring(1, selector.length - 1);
      browser.waitUntil(() => {
        return this.createDrawerRestricted.getAttribute(attribute) === 'false';
      }, constants.wait.normal);
    }

    this.createDrawerSubmit.click();

    this.drawerTitle.waitForExist(constants.wait.normal, true);
    // this.waitForNotice(`User ${userConfig.username} created successfully`);

    if (!userConfig.hasOwnProperty('restricted')) {
      $('[data-qa-user-row]').waitForDisplayed(constants.wait.normal);

      browser.waitUntil(
        function() {
          return (
            $$('[data-qa-user-row]').filter(
              u => u.$('[data-qa-username]').getText() === userConfig.username
            ).length > 0
          );
        },
        constants.wait.normal,
        'User failed to display in table'
      );
    } else {
      this.userDetailHeader.waitForDisplayed(constants.wait.normal);
    }
  }

  delete(userConfig) {
    this.userTableActionMenu(userConfig.username, 'Delete');
    this.dialogTitle.waitForText(constants.wait.normal);
    this.dialogConfirmDelete.waitForDisplayed(constants.wait.normal);
    this.dialogConfirmCancel.waitForDisplayed(constants.wait.normal);
    this.dialogConfirmDelete.click();

    // Wait for only 1 user row in the table (the root user)
    browser.waitUntil(function() {
      return $$('[data-qa-user-row]').length === 1;
    }, constants.wait.normal);
    // this.waitForNotice(`User ${userConfig.username} deleted successfully`, constants.wait.normal);
  }

  viewPermissions(username) {
    this.userTableActionMenu(username, 'User Permissions');
  }

  viewProfile(username) {
    this.userTableActionMenu(username, 'User Profile');
  }

  userTableActionMenu(username, actionMenuSelection) {
    this.getTableDetails(
      undefined,
      this.userActionMenu.selector,
      username
    ).click();
    this.actionMenuItem.waitForDisplayed(constants.wait.normal);
    const menuSelection = $(
      `[data-qa-action-menu-item="${actionMenuSelection}"]`
    );
    menuSelection.waitForDisplayed(constants.wait.normal);
    menuSelection.click();
  }

  getTableDetails(index, tableselector, tableKey = undefined) {
    let indexOfRow;
    if (index === undefined && tableKey !== undefined) {
      browser.waitUntil(() => {
        indexOfRow = this.userRows.findIndex(row =>
          row.getText().includes(tableKey)
        );
        return indexOfRow >= 0;
      }, constants.wait.long);
    } else {
      indexOfRow = index;
    }
    return $$(`${this.userRow.selector} ${tableselector}`)[indexOfRow];
  }
}

export default new Users();
