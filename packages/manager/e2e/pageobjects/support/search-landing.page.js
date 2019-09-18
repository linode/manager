const { constants } = require('../../constants');

import Page from '../page';

class SupportSearchLanding extends Page {
  get searchInput() {
    return $('[data-qa-search-landing-input] input');
  }
  get documentationResults() {
    return this.resultsSection('Documentation');
  }
  get communityResults() {
    return this.resultsSection('Community Posts');
  }
  get viewMoreDocumentation() {
    return this.viewMoreResults('Documentation');
  }
  get viewMoreCommunity() {
    return this.viewMoreResults('Community Posts');
  }
  get searchResult() {
    return '[data-qa-search-result]';
  }
  get searchResults() {
    return $$(this.searchResult);
  }

  searchLandingDisplays() {
    this.searchInput.WaitForDisplayed(constants.wait.normal);
    this.documentationResults.WaitForDisplayed(constants.wait.normal);
    this.communityResults.WaitForDisplayed(constants.wait.normal);
    this.viewMoreDocumentation.WaitForDisplayed(constants.wait.normal);
    this.viewMoreCommunity.WaitForDisplayed(constants.wait.normal);
  }

  search(query) {
    this.searchInput.setValue(query);
    browser.pause(1000);
    browser.waitUntil(() => {
      return this.searchResults.length > 0;
    }, constants.wait.long);
  }

  viewMoreResults(resultType) {
    return $(`[data-qa-view-more="${resultType}"]`);
  }

  resultsSection(resultType) {
    return $(`[data-qa-results="${resultType}"]`);
  }

  resultSet(resultType) {
    this.resultsSection(resultType).WaitForDisplayed(constants.wait.normal);
    return this.resultsSection(resultType)
      .$('..')
      .$$(this.searchResult);
  }
}

export default new SupportSearchLanding();
