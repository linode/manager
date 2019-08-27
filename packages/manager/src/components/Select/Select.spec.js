const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Select Suite', () => {
  const component = 'Select';
  const childStories = ['Example'];
  const select = '[data-qa-select]';
  let selectBoxes, enabledSelects, disabledSelects, selectOptions;

  beforeAll(() => {
    navigateToStory(component, childStories[0]);
    $('[data-qa-select]').waitForDisplayed();
  });

  it('should display select boxes with labels, action text and chevron', () => {
    selectBoxes = $$(select);
    selectBoxes.forEach(s => {
      expect(s.isDisplayed())
        .withContext(`Select box should be displayed`)
        .toBe(true);
      expect(
        s
          .$('..')
          .$('..')
          .$('label')
          .isDisplayed()
      )
        .withContext(`Select label should be displayed`)
        .toBe(true);
      expect(
        s
          .$('..')
          .$('..')
          .$('p')
          .isDisplayed()
      )
        .withContext(`paragraph should be displayed`)
        .toBe(true);
      expect(s.$('svg').isDisplayed())
        .withContext(`Select chevron should be displayed`)
        .toBe(true);
    });
  });

  it('should display one enabled select', () => {
    enabledSelects = selectBoxes.filter(
      s => !s.getAttribute('class').includes('disabled')
    );
    expect(enabledSelects.length)
    .withContext(`Should be 2 enabled selects`)
    .toEqual(2);
  });

  it('should display one disabled select', () => {
    const disabledSelects = selectBoxes.filter(s =>
      s.getAttribute('class').includes('disabled')
    );
    expect(disabledSelects.length)
    .withContext(`Should be 1 disabled select`)
    .toEqual(1);
  });

  it('should display placeholder text in disabled select', () => {
    const disabledSelects = selectBoxes.filter(s =>
      s.getAttribute('class').includes('disabled')
    );
    expect(disabledSelects[0].getText())
      .withContext(`Should have words`)
      .toMatch(/\w/g);
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
    selectOptions.forEach(opt => expect(opt.isDisplayed())
      .withContext(`Option should be displayed`)
      .toBe(true));
  });

  it('should update select value on selection', () => {
    const optionName = selectOptions[1].getText();
    selectOptions[1].click();
    const selectValue = enabledSelects[0].getText();
    expect(selectValue)
      .withContext(`Incorrect option selected`)
      .toBe(optionName);
  });
});
