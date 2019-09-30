const { constants } = require('../../constants');
import Create from '../../pageobjects/create';

describe('Create - Menu Suite', () => {
  beforeEach(() => {
    browser.url(constants.routes.dashboard);
  });

  it('should display create linode in header and link to create linode page', () => {
    $('[data-qa-add-new-menu-button]').waitForDisplayed(constants.wait.normal);
    $('[data-qa-circular-progress]').waitForExist(constants.wait.normal, true);
    $('[data-qa-add-new-menu-button]').click();
    Create.linodeMenuItem.waitForDisplayed(constants.wait.normal);
    expect(Create.linodeMenuItem.isDisplayed()).toBe(true);

    Create.linode();
    Create.selectionCards.forEach(card =>
      expect(card.isDisplayed()).toBe(true)
    );
  });

  xit('TODO - should display create volume in header and link to create volume page', () => {
    Create.menuButton.click();
    expect(Create.volumeMenuItem.isDisplayed()).toBe(true);

    Create.volume();
  });

  xit('TODO - should display create nodebalancer in header and link to create nodebalancer page', () => {
    Create.menuButton.click();
    expect(Create.nodeBalancerMenuItem.isDisplayed()).toBe(true);

    Create.nodebalancer();
  });
});
