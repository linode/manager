const { constants } = require('../constants');
const { assertLog } = require('../utils/assertionLog');

import Page from './page';

class SearchBar extends Page {
  get searchElem() {
    return $('#search-bar');
  }
  get searchInput() {
    return $('#search-bar input');
  }
  get searchIcon() {
    return $('[data-qa-search-icon]');
  }
  get suggestion() {
    return $('[data-qa-suggestion]');
  }
  get suggestions() {
    return $$(this.suggestion.selector);
  }
  get suggestionTitle() {
    return $('[data-qa-suggestion-title]');
  }
  get suggestionDesc() {
    return $('[data-qa-suggestion-title]');
  }

  executeSearch(query) {
    this.searchElem.waitForDisplayed(constants.wait.normal);
    this.searchElem.click();
    this.searchInput.setValue(query);
  }

  searchAndNavigateToResults(query) {
    this.executeSearch(query);
    this.suggestion.waitForDisplayed(constants.wait.normal);
    this.searchInput.addValue(this.enterKey);
  }

  assertSearchDisplays() {
    this.searchIcon.waitForDisplayed(constants.wait.normal);
    this.searchElem.waitForDisplayed(constants.wait.normal);
    this.searchInput.waitForDisplayed(constants.wait.normal);
  }

  assertSuggestions() {
    $('[data-qa-suggestion]').waitForDisplayed(constants.wait.normal);

    // Assert suggestions display icons, titles, descriptions
    this.suggestions.forEach(el => {
      const iconVisible = el.$('svg').isÏDisplayed();
      const titleVisible = el.$(this.suggestionTitle.selector).isÏDisplayed();
      const descriptionVisible = el
        .$(this.suggestionDesc.selector)
        .isÏDisplayed();

      expect(iconVisible)
        .withContext(`"${el} svg" selector ${assertLog.displayed}`)
        .toBe(true);
      expect(titleVisible)
        .withContext(
          `"${this.suggestionTitle.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      expect(descriptionVisible)
        .withContext(
          `"${this.suggestionDesc.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
    });
  }

  navigateToSuggestion(suggestion) {
    $('[data-qa-suggestion]').waitForDisplayed(constants.wait.normal);

    suggestion.click();
    $('[data-qa-circle-progress]').waitForDisplayed(
      constants.wait.normal,
      true
    );
  }

  selectByKeyDown() {
    this.searchInput.setValue('\uE015');

    $('[data-qa-suggestion]').waitForDisplayed(constants.wait.normal);
    // key down and enter fails to work on firefox
    const selected = this.suggestions[0].getAttribute('data-qa-selected');
    expect(selected)
      .withContext(`${assertLog.incorrectAttr} "${selected} " selector`)
      .toBe('true');
  }
}

export default new SearchBar();
