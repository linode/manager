const { constants } = require('../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../utils/common';
import SearchBar from '../../pageobjects/search.page';

describe('Search - Tags Suite', () => {
  const tags = [`foo${new Date().getTime()}`, `bar${new Date().getTime()}`];
  const linodeLabel = `L${new Date().getTime()}`;
  let linodeConfig;

  beforeAll(() => {
    linodeConfig = apiCreateLinode(linodeLabel, false, tags);
    browser.url(constants.routes.dashboard);
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });

  it('should display linode when searching for tag', () => {
    SearchBar.executeSearch(tags[0]);
    SearchBar.assertSuggestions();

    const suggestionTitle = SearchBar.suggestionTitle.getText();
    const tagTitle = SearchBar.tags.map(tag => tag.getText());
    console.log(tagTitle);

    expect(tagTitle.includes(tags[0])).toBe(true);
    expect(suggestionTitle).toBe(linodeLabel);
    $('body').click();
  });

  it('should route to the linode detail on click', () => {
    SearchBar.executeSearch(tags[1]);
    SearchBar.assertSuggestions();
    SearchBar.suggestions[0].click();
    browser.waitUntil(function() {
      return browser.getUrl().includes(linodeConfig.id);
    }, constants.wait.normal);
  });
});
