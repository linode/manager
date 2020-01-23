const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Debounced Search Suite', () => {
  const component = 'Debounced Search';
  const childStories = ['Select Field', 'Text Field'];

  describe('Select Field Suite', () => {
    let selectedOptionMsg, selectOptions;

    const placeholderMsg = 'Search for something (i.e "er")';
    const enhancedSelect = `[data-qa-enhanced-select]`;
    const enhancedSelectInput = `[data-qa-enhanced-select] input`;
    const currentResultSelector = '[data-qa-selected-result]';
    const optionSelector = '[data-qa-option]';
    const emptyResult = 'You selected:';
    const validQuery = 'keyboard';

    beforeEach(() => {
      navigateToStory(component, childStories[0]);
    });

    it('should display select search bar', () => {
      expect($(enhancedSelect).isDisplayed())
        .withContext(`Enhanced Select should be displayed`)
        .toBe(true);
      expect($(enhancedSelect).getText())
        .withContext(`Incorrect text value`)
        .toContain(placeholderMsg);
    });

    it('should not have options selected on pageload', () => {
      selectedOptionMsg = $(currentResultSelector);
      expect(selectedOptionMsg.getText())
        .withContext(`Should have no results`)
        .toBe(emptyResult);
    });

    it('should display no options on a bad search query', () => {
      const badQuery = 'akjsdhfklj';
      $(enhancedSelectInput).setValue(badQuery);
      $('[data-qa-no-options]', constants.wait.normal).waitForDisplayed();
    });

    it('should display options on a valid search query', () => {
      // Add the value twice to fix test flakiness when running the entire functional test suite
      $(enhancedSelectInput).setValue(validQuery);
      $(enhancedSelectInput).setValue(validQuery);

      browser.waitUntil(() => {
        return $(optionSelector).isDisplayed();
      }, constants.wait.normal);

      expect($(optionSelector).isDisplayed())
        .withContext(`select option not displayed`)
        .toBe(true);

      browser.waitUntil(() => {
        return $(optionSelector).isDisplayed();
      }, constants.wait.normal);

      expect($(optionSelector).isDisplayed())
        .withContext(`select option not displayed`)
        .toBe(true);

      selectOptions = $$(optionSelector);
      expect(selectOptions.length)
        .withContext(`Should only have one result`)
        .toBe(1);
    });

    it('should update the selected option text on select', () => {
      $(enhancedSelectInput).setValue('apples');
      $(optionSelector, constants.wait.normal).waitForDisplayed();
      $(optionSelector).click();

      selectedOptionMsg = $(currentResultSelector);
      expect(selectedOptionMsg.getText())
        .withContext(`Incorrect text found`)
        .toBe('You selected: apples');
    });
  });

  describe('Text Field Suite', () => {
    let searchTextfield,
      displayedListItems,
      initialOptions = [];

    const debouncedSearchSelector = '[data-qa-debounced-search]';
    const listItemSelector = '[data-qa-list-item]';
    const validQuery = 'apples';
    const mainList = '[data-qa-listOfItems]';

    beforeEach(() => {
      navigateToStory(component, childStories[1]);
    });

    it('should display the debounced search text field', () => {
      const placeholderMsg = 'Search for something';
      searchTextfield = $(debouncedSearchSelector).$('input');

      expect(searchTextfield.getAttribute('placeholder'))
        .withContext(`Incorrect placeholder text`)
        .toBe(placeholderMsg);
    });

    it('should display unfiltered list of options', () => {
      displayedListItems = $$(listItemSelector);
      displayedListItems.forEach(i => {
        expect(i.isDisplayed())
          .withContext(`Unfiltered options should be displayed`)
          .toBe(true);
        expect(i.getText())
          .withContext(`Incorrect text match`)
          .toMatch(/\w/gi);
        initialOptions.push(i.getText());
      });
    });

    it('should display no options on a bad search query', () => {
      const badQuery = 'lkajsdkhsdklf';
      searchTextfield.setValue(badQuery);
      expect(searchTextfield.getAttribute('value'))
        .withContext(`Incorrect text found`)
        .toEqual(badQuery);
      $(mainList + ' li').waitForDisplayed(constants.wait.normal, true);
    });

    it('should display a single option on query of a single matching list item', () => {
      searchTextfield = '[data-qa-debounced-search] input';
      $(searchTextfield).setValue(validQuery);
      browser.waitUntil(() => {
        displayedListItems = $$(listItemSelector);
        return displayedListItems.length === 1;
      }, constants.wait.normal);
      expect(displayedListItems[0].getText())
        .withContext(`Incorrect query value found`)
        .toBe(validQuery);
    });

    it('should display all list options on clear', () => {
      validQuery.split('').forEach(i => {
        $(debouncedSearchSelector)
          .$('input')
          .addValue('\uE003');
      });

      browser.waitUntil(() => {
        displayedListItems = $$(listItemSelector);
        return displayedListItems.length === initialOptions.length;
      }, constants.wait.normal);

      const currentOptions = $$(listItemSelector).map(i => i.getText());

      expect(currentOptions).toEqual(initialOptions);
    });
  });
});
