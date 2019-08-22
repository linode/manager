const { executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Help Icon Component Suite', () => {
  const component = 'HelpIcon';
  const childStories = [
    'default',
    'center',
    'left',
    'right',
  ]

  const helpButton = '[data-qa-help-button]';
  const popoverText = '[role="tooltip"]';

  it('should display icon on the page', () => {
    executeInAllStories(component, childStories, () => {
        $(helpButton).waitForDisplayed();
    });
  });

  it('should display popover text on Mouse Over', () => {
    executeInAllStories(component, childStories, () => {
      $(helpButton).waitForDisplayed();
      $(helpButton).click();
      expect($(helpButton).getAttribute('aria-describedby'))
        .withContext(`aria-describedby attribute is missing`)
        .not.toBeNull();
      expect($(popoverText).getText())
        .withContext(`Incorrect hover text`)
        .toBe('There is some help text! Yada, yada, yada...');
    });
  });

  it('should hide popover text on Mouse Out', () => {
    executeInAllStories(component, childStories, () => {
      $(helpButton).waitForDisplayed();
      expect($(helpButton).getAttribute('aria-describedby'))
        .withContext(`aria-describedby attribute should be empty`)
        .toBeNull();
    });
  });
});
