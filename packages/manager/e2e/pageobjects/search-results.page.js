const { constants } = require('../constants');

import Page from './page';

class SearchResults extends Page {
  headerSelector(entityType) {
    const entity =
      entityType.charAt(0).toUpperCase() + entityType.toLowerCase().slice(1);
    return `[data-qa-entity-header="${entity}"]`;
  }

  headerElement(entityType) {
    return $(this.headerSelector(entityType));
  }

  resultSelector(entityName) {
    return `[data-qa-result-row="${entityName}"]`;
  }

  resultTagsSelector(entityName) {
    return `${this.resultSelector(entityName)} ${this.tag.selector}`;
  }

  resultElement(entityName) {
    return $(this.resultSelector(entityName));
  }

  waitForSearchResult(entityType, entityName) {
    this.headerElement(entityType).waitForDisplayed(constants.wait.normal);
    this.resultElement(entityName).waitForDisplayed(constants.wait.normal);
  }

  getTagsAppliedToResult(entityName) {
    $(this.resultTagsSelector(entityName)).waitForDisplayed(
      constants.wait.normal
    );
    return $$(this.resultTagsSelector(entityName)).map(tag => tag.getText());
  }
}

export default new SearchResults();
