const { navigateToStory } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Enhanced Select -', () => {
  let selectElement, selectOptions;
  const component = 'Enhanced Select';
  const childComponents = ['Example'];

  beforeAll(() => {
    navigateToStory(component, childComponents[0]);
  });

  describe('Basic Select -', () => {
    let basicSelect, basicSelects, options;

    it('should display the placeholder text in the select', () => {
      selectLabels = $$('[data-qa-textfield-label]');
      basicSelects = $$('[data-qa-enhanced-select="Choose one fruit"]');
      let placeholderMsg = 'Choose one fruit';

      expect(selectLabels[0].getText())
        .withContext(`Select Title should be Basic Select`)
        .toContain('Basic Select');
      expect(basicSelects[0].getText())
        .withContext(`Placeholder message should be ${placeholderMsg}`)
        .toContain(placeholderMsg);
    });

    it('should display options on click', () => {
      const basicSelectInputs = basicSelects.map(s => s.$('div'));
      basicSelectInputs[0].click();
      $('[data-qa-option]', constants.wait.normal).waitForDisplayed();

      options = $$('[data-qa-option]');
      expect(options.length)
        .withContext(`There should be 5 select options`)
        .toBe(5);
    });

    it('should update the select value on selection', () => {
      const optionValue = options[0].getText();

      options[0].click();
      options[0].waitForDisplayed(constants.wait.normal, true);
      $(
        `[data-qa-enhanced-select="${optionValue}"]`,
        constants.wait.normal
      ).waitForDisplayed();
    });
  });

  describe('Basic Select with Error - ', () => {
    it('should display the error', () => {
      const errorMsg = "You didn't choose the correct fruit.";
      const errorSelectors = $$('[data-qa-textfield-error-text]');

      expect(errorSelectors.length)
        .withContext(`Should only be one <p> with error text`)
        .toBe(1);
      expect(errorSelectors[0].getText())
        .withContext(`The error message should be displayed`)
        .toBe(errorMsg);
    });
  });

  describe('Multi Select -', () => {
    let multiSelect, options, selectedOption;
    const multiString = 'Choose some fruit';
    it('should display the multi select with placeholder text', () => {
      multiSelect = $(`[data-qa-multi-select="${multiString}"]`);
      expect(multiSelect.getText())
        .withContext(`Placeholder text should be ${multiString}`)
        .toBe(`${multiString}`);
    });

    it('should display options on click', () => {
      multiSelect.click();

      options = $$('[data-qa-option');
      expect(options.length)
        .withContext(`Menu options should be 5`)
        .toBe(5);
    });

    it('should add a chip to the select on selection of an option', () => {
      selectedOption = options[0].getText();
      options[0].click();
      $(
        `[data-qa-multi-option="${selectedOption}"]`,
        constants.wait.normal
      ).waitForDisplayed();
    });

    it('should remove the chip from the select options', () => {
      $('[data-qa-multi-option]').click();
      $('[data-qa-option]', constants.wait.normal).waitForDisplayed();
      const remainingOptions = $$('[data-qa-option]').map(opt => opt.getText());

      expect(remainingOptions.length)
        .withContext(`Menu options should be reduced to 4`)
        .toBe(4);
      expect(remainingOptions)
        .withContext(
          `Menu options should no longer include selected ${selectedOption}`
        )
        .not.toContain(selectedOption);
    });

    it('should remove the chip on click of the remove icon', () => {
      $('#multi-select svg').click();
      expect((selectedOption = options[0].getText()))
        .withContext(`Apple should be the first select option`)
        .toBe('Apple');
      expect(multiSelect.getText())
        .withContext(`Default select text should be ${multiString}`)
        .toBe(`${multiString}`);
    });
  });

  describe('Creatable Select -', () => {
    let creatableSelect, newOption;
    const createdText = 'Choose some timezones';

    beforeAll(() => {
      // Close any potentially open select menus
      $('body').click();
    });

    it('should display the creatable select with placeholder text', () => {
      creatableSelect = $('[data-qa-multi-select="Choose some timezones"]');

      expect(creatableSelect.isDisplayed())
        .withContext(`Creatable Select text should be displayed`)
        .toBe(true);
      expect(creatableSelect.getText())
        .withContext(`Placeholder text should be ${createdText}`)
        .toBe(`${createdText}`);
    });

    it('should display the create menu option', () => {
      newOption = 'foo';
      creatableSelect
        .$('..')
        .$('input')
        .setValue(newOption);
      expect($(`[data-qa-option="${newOption}"]`).isDisplayed())
        .withContext(`Select option of ${newOption} should be displayed`)
        .toBe(true);
      expect($(`[data-qa-option="${newOption}"]`).getText())
        .withContext(`Selected option value should be ${newOption}`)
        .toBe(`Create "${newOption}"`);
    });

    it('should add a created option to the select', () => {
      $(`[data-qa-option="${newOption}"]`).click();
      $(
        `[data-qa-multi-option="${newOption}"]`,
        constants.wait.normal
      ).waitForDisplayed();
    });

    it('should select an already defined list option', () => {
      $(`[data-qa-multi-option="${newOption}"]`).click();

      const optionToSelect = $$('[data-qa-option]');
      const optionName = optionToSelect[0].getText();
      optionToSelect[0].click();

      $(`[data-qa-multi-option="${optionName}"]`).waitForDisplayed(
        constants.wait.normal
      );
    });

    it('should remove the created option on click of remove icon', () => {
      $(`[data-qa-multi-option="${newOption}"]`)
        .$('..')
        .$('svg')
        .click();
      expect(
        $(`[data-qa-multi-option="${newOption}"]`).waitForDisplayed(
          constants.wait.normal,
          true
        )
      )
        .withContext(`${newOption} should not be in the select list`)
        .toBe(true);
    });
  });
});
