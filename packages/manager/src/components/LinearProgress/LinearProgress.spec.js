const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Linear Progress Bar Suite', () => {
  const linearProgress = '[data-qa-linear-progress]';
  const component = 'Linear Progress Indicator';
  const childStories = [
    'Indefinite',
  ]

  beforeAll(() => {
    navigateToStory(component, childStories[0]);
  });

  it('should display indefinite linear bar on the page', () => {
    $(linearProgress).waitForDisplayed();

    const progressBar = $(linearProgress);
    const role = progressBar.getAttribute('role');

    expect(progressBar.isDisplayed())
      .withContext(`Progress bar should be displayed`)
      .toBe(true);
    expect(role)
      .withContext(`Incorrect role`)
      .toBe('progressbar');
  });

  it('should have correct CSS properties', () => {
    $(linearProgress).waitForDisplayed();

    const progressBar = $(linearProgress);
    const progressBarColor = progressBar.getCSSProperty('background-color').parsed.hex
    const barPrimaryColor = $('.MuiLinearProgress-barColorPrimary').getCSSProperty('background-color').parsed.hex

    expect(progressBarColor)
      .withContext(`Incorrect color used`)
      .toBe('#b7d6f9');
    expect(barPrimaryColor)
      .withContext(`Incorrect color used`)
      .toBe('#3683dc');
  });
});
