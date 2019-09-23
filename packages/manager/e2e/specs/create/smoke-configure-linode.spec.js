const { constants } = require('../../constants');
import ConfigureLinode from '../../pageobjects/configure-linode';
import CheckoutSummary from '../../pageobjects/checkout-summary';

describe('Create Linode - Configure Linode Suite', () => {
  beforeAll(() => {
    ConfigureLinode.selectGlobalCreateItem('Linode');
  });

  beforeEach(() => {
    browser.refresh();
    $('[data-qa-create-linode-header]').waitForDisplayed(constants.wait.short);
  });

  it('should display configure elements', () => {
    ConfigureLinode.baseDisplay();
  });

  it('should update cost summary on plan selection', () => {
    $('[data-qa-tp="Linode Plan"] [data-qa-plan-header]').waitForDisplayed();
    ConfigureLinode.plans.forEach(p => {
      const originalPrice = CheckoutSummary.costSummary.getText();
      p.click();
      const updatedPrice = CheckoutSummary.costSummary.getText();
      expect(updatedPrice)
        .withContext(`incorrect summary price`)
        .not.toBe(originalPrice);
    });
  });

  it('should configure a generic linode and update cost summary', () => {
    const genericPrice = CheckoutSummary.costSummary.getText();
    const genericType = ConfigureLinode.planNames[1].getText();
    ConfigureLinode.generic();
    const genericImage = ConfigureLinode.imageName.getText();

    expect(CheckoutSummary.costSummary.getText())
      .withContext(`incorrect cost summary value`)
      .toBeGreaterThan(genericPrice);
    expect(CheckoutSummary.imageDetailDisplays(genericImage))
      .withContext(`image detail "${genericImage}" image should be displayed`)
      .toBe(true);
    expect(CheckoutSummary.subheaderDisplays(genericType))
      .withContext(`Linode plan "${genericType}" type should be displayed`)
      .toBe(true);
  });

  it('should display a region select', () => {
    expect(ConfigureLinode.regionSelect.isDisplayed())
      .withContext(`region select should be displayed`)
      .toBe(true);
  });

  it('should select a specific image', () => {
    const imageName = 'CentOS 7';
    browser.enhancedSelect(ConfigureLinode.imageDistro.selector, imageName);

    expect(CheckoutSummary.imageDetailDisplays(imageName))
      .withContext(`distribution name ${imageName} should be displayed`)
      .toBe(true);
  });
});
