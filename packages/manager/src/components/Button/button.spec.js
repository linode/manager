const {
  navigateToStory,
  executeInAllStories,
} = require('../../../e2e/utils/storybook');

describe('Button Suite', () => {
  const component = 'Button';
  const childStories = [
    'Types',
    'Disabled',
    'Primary Dropdown',
    'Secondary Dropdown',
  ];
  const button = {
    generic: '[data-qa-button]',
    primary: '[data-qa-button="primary"]',
    secondary: '[data-qa-button="secondary"]',
    primaryDropdown: '[data-qa-button="Primary Dropdown"]',
    secondaryDropdown: '[data-qa-button="Secondary Dropdown"]',
  };

  it('should display buttons in each story', () => {
    executeInAllStories(component, childStories, () => {
      $(button.generic).waitForDisplayed();
      const buttons = $$(button.generic);
      buttons.forEach((b) =>
        expect(b.isDisplayed())
          .withContext(`button should be displayed`)
          .toBe(true)
      );
    });
  });

  describe('Types Button Suite', () => {
    let primaryButtons, secondaryButtons;

    beforeAll(() => {
      navigateToStory(component, childStories[1]);
    });

    it('should display primary button', () => {
      $(button.primary).waitForDisplayed();

      primaryButtons = $$(button.primary);
      expect(primaryButtons.length)
        .withContext(`should only be one primary button`)
        .toBe(1);
    });

    it('should display primary buttons with white text', () => {
      primaryButtons.forEach((button) => {
        expect(button.getCSSProperty('color').parsed.hex.includes('#ffffff'))
          .withContext(`incorrect color`)
          .toBe(true);
      });
    });

    it('should have primary included in the class of each button', () => {
      primaryButtons.forEach((button) => {
        expect(button.getAttribute('class').includes('Primary'))
          .withContext(`missing Primary class`)
          .toBe(true);
      });
    });

    it('should display secondary button', () => {
      const secondaryButton = $(button.secondary);
      secondaryButtons = $$(button.secondary);

      expect(secondaryButton.isDisplayed())
        .withContext(`secondary button should be displayed`)
        .toBe(true);
      expect(secondaryButtons.length)
        .withContext(`should only be one secondary button`)
        .toBe(1);
    });

    it('should display secondary buttons with transparent backgrounds', () => {
      secondaryButtons.forEach((button) => {
        expect(button.getCSSProperty('background-color').parsed.hex)
          .withContext(`incorrect color background color`)
          .toBe('#000000');
      });
    });

    it('should have secondary included in class of each button', () => {
      secondaryButtons.forEach((button) => {
        expect(button.getAttribute('class').includes('Secondary'))
          .withContext(`missing Secondary class`)
          .toBe(true);
      });
    });
  });

  describe('Secondary Dropdown', () => {
    let secondaryDropdowns;

    beforeAll(() => {
      navigateToStory(component, childStories[3]);
      $(button.generic).waitForDisplayed();
    });

    it('should display dropdown buttons with carat', () => {
      secondaryDropdowns = $$(button.secondaryDropdown);
      secondaryDropdowns.forEach((s) => {
        expect(s.$('svg').isDisplayed())
          .withContext(`svg should be displayed`)
          .toBe(true);
      });
    });

    it('should have secondary included in class of each dropdown', () => {
      secondaryDropdowns.forEach((d) => {
        expect(d.getAttribute('class').includes('Secondary'))
          .withContext(`missing Secondary class`)
          .toBe(true);
      });
    });
  });
});
