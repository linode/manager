const { navigateToStory } = require('../../../e2e/utils/storybook');
const zxcvbn = require('zxcvbn');

describe('Password Input Suite', () => {
  const component = 'Password Input';
  const childStories = ['Example'];
  const strengthIndicator = '[data-qa-strength]';
  const passwordInput = '[data-qa-hide] input';

  beforeEach(() => {
    navigateToStory(component, childStories[0]);
  });

  it('should display password input with strength indicator', () => {
    $(passwordInput).waitForDisplayed();

    const input = $(passwordInput);

    expect(input.isExisting())
      .withContext(`Input field does not exist`)
      .toBe(true);
  });

  describe('should update the strength when complexity of password increases', () => {
    const testPasswords = ['weak', 'stronger1233', 'Stronger123#!'];

    testPasswords.forEach((pass) => {
      const expectedStrength = zxcvbn(pass).score;
      it(`check strength Indicator ${pass}, strength ${expectedStrength}`, () => {
        $(passwordInput).setValue(pass);

        const strengthDisplays = $(strengthIndicator).isDisplayed();
        const strength = $(strengthIndicator).getAttribute('data-qa-strength');

        expect(strengthDisplays)
          .withContext(`Password strength should be displayed`)
          .toBe(true);

        expect(parseInt(strength, 10))
          .withContext(
            `Incorrect strength indicator value for ${pass}, ${expectedStrength}`
          )
          .toBe(expectedStrength);
      });
    });
  });

  it('should display/hide password when click show', () => {
    // make it show
    $('[data-qa-hide] svg').click();

    const isHidden = () => $('[data-qa-hide]').getAttribute('data-qa-hide');
    const getType = () => $(passwordInput).getAttribute('type');

    expect(isHidden())
      .withContext(`Password should be displayed`)
      .toBe('false');
    expect(getType()).withContext(`Incorrect type`).toBe('text');
    // hide it again
    $('[data-qa-hide] svg').click();
    expect(isHidden()).withContext(`Password should be hidden`).toBe('true');
    expect(getType()).withContext(`Incorrect type`).toBe('password');
  });
});
