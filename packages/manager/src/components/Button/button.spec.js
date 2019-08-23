const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Button Suite', () => {
  const component = 'Button';
  const childStories = [
    'Types',
    'Disabled',
    'Primary Dropdown',
    'Secondary Dropdown',
    'Destructive',
  ]
  const button = {
    generic: '[data-qa-button]',
    primary: '[data-qa-button="primary"]',
    secondary: '[data-qa-button="secondary"]',
    primaryDropdown:  '[data-qa-button="Primary Dropdown"]',
    secondaryDropdown: '[data-qa-button="Secondary Dropdown"]',
    destructive: '[data-qa-button="Destructive"]',
  }

  it('should display buttons in each story', () => {
    executeInAllStories(component, childStories, () => {
      $(button.generic).waitForDisplayed();
      const buttons = $$(button.generic);
      buttons.forEach(b => expect(b.isDisplayed())
        .withContext(`button should be displayed`)
        .toBe(true));
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
      primaryButtons.forEach(button => {
        expect(button.getCSSProperty('color').parsed.hex.includes('#ffffff'))
          .withContext(`incorrect color`)
          .toBe(true);
      });
    });

    it('should have primary included in the class of each button', () => {
      primaryButtons.forEach(button => {
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
      secondaryButtons.forEach(button => {
        expect(button.getCSSProperty('background-color').parsed.hex)
          .withContext(`incorrect color background color`)
          .toBe('#000000')
      });
    });

    it('should have secondary included in class of each button', () => {
      secondaryButtons.forEach(button => {
        expect(button.getAttribute('class').includes('Secondary'))
          .withContext(`missing Secondary class`)
          .toBe(true);
      });
    });
  });

  describe('Primary Dropdown', () => {
    let primaryDowndowns;

    beforeAll(() => {
      navigateToStory(component, childStories[2]);
      $(button.generic).waitForDisplayed();
    });

    it('should display dropdown buttons with carat', () => {
      primaryDropdowns = $$(button.primaryDropdown);
      primaryDropdowns.forEach(d => {
        expect(d.$('svg').isDisplayed())
          .withContext(`svg should be displayed`)
          .toBe(true);
      });
    });

    it('should have primary included in class of each dropdown', () => {
      primaryDropdowns.forEach(d => {
        expect(d.getAttribute('class').includes('Primary'))
          .withContext(`missing Primary class`)
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
      secondaryDropdowns.forEach(s => {
        expect(s.$('svg').isDisplayed())
          .withContext(`svg should be displayed`)
          .toBe(true);
      });
    });

    it('should have secondary included in class of each dropdown', () => {
      secondaryDropdowns.forEach(d => {
        expect(d.getAttribute('class').includes('Secondary'))
          .withContext(`missing Secondary class`)
          .toBe(true);
      });
    });
  });

  describe('Destructive Button', () => {

    beforeAll(() => {
      navigateToStory(component, childStories[4]);
    });

    let destructiveButtons;

    it('should display an enabled destructive button and a disabled button', () => {
      destructiveButtons = $$(button.generic);
      const disabledButtons = destructiveButtons.filter(d => d.getAttribute('class').includes('disabled'));

      destructiveButtons.forEach(d => {
        expect(d.isDisplayed())
          .withContext(`destructive button should be displayed`)
          .toBe(true);
      });

      expect(destructiveButtons.length)
        .withContext(`incorrect number of destructive buttons`)
        .toBe(2);

      disabledButtons.forEach(d => {
        expect(d.isDisplayed())
          .withContext(`disabled button should be displayed`)
          .toBe(true);
      });

      expect(disabledButtons.length)
        .withContext(`incorrect number of disabled buttons`)
        .toBe(1);
    });
  });
});
