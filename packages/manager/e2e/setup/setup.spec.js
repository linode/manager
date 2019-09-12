const { constants } = require('../constants');
const { readToken } = require('../utils/config-utils');

describe('Setup Tests Suite', () => {
  beforeAll(() => {
    browser.url(constants.routes.linodes);
    $('[data-qa-circle-progress]').waitForDisplayed(
      constants.wait.normal,
      true
    );
  });

  it('should remove all account data', () => {
    const token = readToken(browser.options.testUser);
    browser.deleteAll(token);
  });

  it('should display placeholder message', () => {
    browser.url(constants.routes.linodes);
    $('[data-qa-circle-progress]').WaitForDisplayed(
      constants.wait.normal,
      true
    );

    // it should wait for linodes to be removed
    browser.waitUntil(
      function() {
        browser.refresh();
        $('[data-qa-add-new-menu-button]').WaitForDisplayed();
        $('[data-qa-circle-progress]').WaitForDisplayed(
          constants.wait.normal,
          true
        );

        try {
          $('[data-qa-placeholder-title]').WaitForDisplayed(
            constants.wait.short
          );
          return true;
        } catch (err) {
          return false;
        }
      },
      constants.wait.long,
      'linodes failed to be removed'
    );
  });
});
