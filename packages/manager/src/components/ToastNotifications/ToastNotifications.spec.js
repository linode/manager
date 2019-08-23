const { navigateToStory } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Toast Notification Suite', () => {
  const component = 'Toast Notification';
  const childStory = 'Default';
  const variants = [
    'success',
    'warning',
    'error',
    'info'
  ];
  const toast = '[data-qa-toast] div';
  const toastColor = '[data-qa-toast] [role="alertdialog"]'

  const notificationButton = (state) => {
    const button = $$('#root>[type="button"]').find(button => button.getText() === state);
    button.waitForDisplayed(constants.wait.normal);
    return button;
  }

  const checkToastColor = (variant, color) => {
    notificationButton(variant).click();

    expect($(toastColor).getCSSProperty('border-left-color').value)
      .withContext(`incorrect variant color`)
      .toBe(color);
    $('[title="Dismiss Notification"]').click();
    $(toastColor).waitForDisplayed(constants.wait.short, true);
  }

  beforeAll(() => {
    navigateToStory(component, childStory);
  });

  it('Toast notification displays with expected variant', () => {
    variants.forEach((variant) => {
      notificationButton(variant).click();
      $(toast).waitForDisplayed(constants.wait.normal);
      expect($(toast).getAttribute('class'))
        .withContext(`incorrect variant type`)
        .toContain(`SnackBar-${variant}`);
      $(toast).waitForDisplayed(constants.wait.normal, true);
    });

    notificationButton('default').click();
    $(toast).waitForDisplayed(constants.wait.normal);
    expect($(toast).getAttribute('class'))
      .withContext(`should not contain variant class`)
      .not.toContain('variant');
    $(toast).waitForDisplayed(constants.wait.normal, true);
  });

  it('Toast notifications have correct color', () => {
    //default
    checkToastColor('default', 'rgba(0,0,0,0)');
    //success
    checkToastColor('success', 'rgba(54,131,220,1)');
    //warning
    checkToastColor('warning', 'rgba(255,208,2,1)');
    //error
    checkToastColor('error', 'rgba(205,34,39,1)');
    //info
    checkToastColor('info', 'rgba(54,131,220,1)');
  });

  it('Toast notification disappears after 4 seconds', () => {
    notificationButton(variants[0]).click();
    browser.pause(4500);
    expect($(toast).isDisplayed())
      .withContext(`toast message is still displayed after 4 seconds`)
      .toBe(false);
  });

  it('No more than 3 notifications display at once', () => {
    notificationButton(variants[0]).click();
    notificationButton(variants[1]).click();
    notificationButton(variants[1]).click();
    notificationButton(variants[1]).click();
    browser.pause(500);
    const successIsNull = $$(toast).find(toast => toast.getAttribute('class').includes('SnackBar-success'));
    expect(successIsNull)
      .withContext(`should not have SnackBar-success class`)
      .toEqual(undefined);
  });
});
