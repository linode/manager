const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Select Suite', () => {
  const component = 'Select';
  const childStories = ['Example'];
  const select = '[data-qa-select]';
  let selectBoxes, enabledSelects, disabledSelects, selectOptions;

  beforeAll(() => {
    navigateToStory(component, childStories[0]);
    browser.waitForVisible('[data-qa-select]');
  });

  it('should display two select boxes with labels, action text and chevron', () => {
    selectBoxes = $$(select);
    selectBoxes.forEach(s => {
      expect(s.isVisible()).toBe(true);
      expect(
        s
          .$('..')
          .$('..')
          .$('label')
          .isVisible()
      ).toBe(true);
      expect(
        s
          .$('..')
          .$('..')
          .$('p')
          .isVisible()
      ).toBe(true);
      expect(s.$('svg').isVisible()).toBe(true);
    });
  });

  it('should display one enabled select', () => {
    enabledSelects = selectBoxes.filter(
      s => !s.getAttribute('class').includes('disabled')
    );
    expect(enabledSelects.length).toEqual(2);
  });

  it('should display one disabled select', () => {
    const disabledSelects = selectBoxes.filter(s =>
      s.getAttribute('class').includes('disabled')
    );
    expect(disabledSelects.length).toEqual(1);
  });

  it('should display placeholder text in disabled select', () => {
    const disabledSelects = selectBoxes.filter(s =>
      s.getAttribute('class').includes('disabled')
    );
    expect(disabledSelects[0].getText()).toMatch(/\w/gi);
  });

  it('should display options on click', () => {
    const selectTitle = enabledSelects[0]
      .$('..')
      .$('..')
      .$('label')
      .getText()
      .toLowerCase();
    enabledSelects[0].click();

    selectOptions = $(`#menu-${selectTitle}`).$$('li');
    selectOptions.forEach(opt => expect(opt.isVisible()).toBe(true));
  });

  it('should update select value on selection', () => {
    const optionName = selectOptions[1].getText();
    selectOptions[1].click();
    const selectValue = enabledSelects[0].getText();
    expect(selectValue).toBe(optionName);
  });
});
