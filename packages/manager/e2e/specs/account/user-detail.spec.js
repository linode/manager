const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import UserDetail from '../../pageobjects/account/user-detail.page';
import Users from '../../pageobjects/account/users.page';

describe('Account - User Detail - Username Suite', () => {
  const userConfig = {
    username: `test-user${new Date().getTime()}`,
    email: `pthiel@linode.com`
  };

  beforeAll(() => {
    browser.url(constants.routes.account.users);
    Users.baseElementsDisplay();
    Users.add(userConfig);
    const userRow = Users.getTableDetails(
      undefined,
      Users.username.selector,
      userConfig.username
    );
    userRow.click();
  });

  describe('User Detail - Update Username Suite', () => {
    it('should display user detail page base elements', () => {
      UserDetail.baseElementsDisplay();
    });

    it('should fail validation on bad username value', () => {
      const badUsernameAscii = '$%#5364é-';
      const badUsername = '$%#5364-';
      UserDetail.updateUsername(badUsernameAscii);
      UserDetail.usernameWarning.waitForDisplayed(constants.wait.normal);
      expect(UserDetail.usernameWarning.getText())
        .withContext(`username cannot contain foreign characters`)
        .toContain('Username must only use ASCII characters.');
      UserDetail.updateUsername(badUsername);
      UserDetail.usernameWarning.waitForDisplayed(constants.wait.normal);
      expect(UserDetail.usernameWarning.getText())
        .withContext(`username cannot contain special characters`)
        .toContain(
          'Username may only contain letters, numbers, dashes, and underscores and must begin and end with letters or numbers.'
        );
    });

    it('should fail to update when submitting an existing username', () => {
      UserDetail.updateUsername(browser.options.testUser);
      UserDetail.usernameWarning.waitForDisplayed(constants.wait.normal);
      expect(UserDetail.usernameWarning.getText()).toContain('Username taken');
    });

    it('should succeed updating with a legitimate username', () => {
      userConfig['username'] = `test${new Date().getTime()}`;
      UserDetail.updateUsername(userConfig.username);
      browser.waitUntil(
        () => {
          return browser.getUrl().includes(userConfig.username);
        },
        constants.wait.normal,
        'url should contain the updated username'
      );
      browser.waitUntil(
        () => {
          return $('#username').getValue() != '';
        },
        constants.wait.normal,
        'username should not be empty'
      );
      expect($('#username').getValue())
        .withContext(`incorrect user name`)
        .toBe(userConfig.username.toLowerCase());
    });
  });

  describe('User Detail - Remove User Suite', () => {
    it('should display the remove dialog', () => {
      browser.refresh();
      UserDetail.deleteButton.click();
      UserDetail.dialogTitle.waitForDisplayed(constants.wait.normal);
      UserDetail.dialogConfirmDelete.waitForDisplayed(constants.wait.normal);
      UserDetail.dialogConfirmCancel.waitForDisplayed(constants.wait.normal);
    });

    it('should dismiss the dialog on cancel', () => {
      UserDetail.dialogConfirmCancel.click();
      browser.waitUntil(
        () => {
          return (
            UserDetail.dialogTitle.isExisting(constants.wait.short) === false
          );
        },
        constants.wait.short,
        'cancel dialog should be dismissed'
      );
      expect(UserDetail.dialogTitle.isDisplayed())
        .withContext(
          `${UserDetail.dialogTitle.selector} ${assertLog.displayed}`
        )
        .toBe(false);
    });

    it('should remove the user', () => {
      UserDetail.deleteButton.click();
      UserDetail.dialogTitle.waitForDisplayed(constants.wait.normal);
      UserDetail.dialogTitle
        .$('..')
        .$(UserDetail.dialogConfirmDelete.selector)
        .click();
      const toastMess = `User ${
        userConfig.username
      } has been deleted successfully.`;
      Users.toastDisplays(toastMess);

      browser.waitUntil(
        () => {
          return !browser.getUrl().includes(userConfig.username);
        },
        constants.wait.normal,
        'url should not contain the deleted user name'
      );
    });
  });
});
