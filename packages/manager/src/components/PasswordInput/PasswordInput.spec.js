const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Password Input Suite', () => {
  const component = 'Password Input';
  const childStories = [
    'Example',
  ]
  const strengthIndicator = '[data-qa-strength]';
  const passwordInput = '[data-qa-hide] input';

  function hideShow(show) {
    $('[data-qa-hide] svg').click();
    const hidden = $('[data-qa-hide]').getAttribute('data-qa-hide');
    const type = $(passwordInput).getAttribute('type');

    if (show) {
      expect(hidden)
        .withContext(`Password should be displayed`)
        .toBe('false');
      expect(type)
        .withContext(`Incorrect type`)
        .toBe('text');
    } else {
      expect(hidden)
        .withContext(`Password should be hidden`)
        .toBe('true');
      expect(type)
        .withContext(`Incorrect type`)
        .toBe('password');
    }
  }

  beforeAll(() => {
      navigateToStory(component, childStories[0]);
  });

  it('should display password input with strength indicator', () => {
    $(passwordInput).waitForDisplayed();

    const input = $(passwordInput);

    expect(input.isExisting())
      .withContext(`Input field does not exist`).toBe(true);
  });

  it('should update the strength when complexity of password increases', () => {
    const testPasswords = ['weak', 'stronger1233', 'Stronger123#!'];
    testPasswords.forEach((pass, index) => {
      $(passwordInput).setValue(pass);
      const strengthDisplays = $(strengthIndicator).isDisplayed();
      const strength = $(strengthIndicator).getAttribute('data-qa-strength');

      expect(strengthDisplays)
        .withContext(`Password strength should be displayed`).toBe(true);
      expect(parseInt(strength))
        .withContext(`Incorrect strength indicator value`).toBe(index + 1);
    });
  });

  it('should display password when click show', () => {
    hideShow(true);
  });

  it('should hide when click hide', () => {
    hideShow();
  });
});
