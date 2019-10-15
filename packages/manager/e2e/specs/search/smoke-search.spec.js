import SearchBar from '../../pageobjects/search.page';
import ListLinodes from '../../pageobjects/list-linodes';
import { apiCreateLinode, apiDeleteAllLinodes } from '../../utils/common';

const { constants } = require('../../constants');

describe('Header - Search Suite', () => {
  let testLinode;

  beforeAll(() => {
    browser.url(constants.routes.linodes);
    apiCreateLinode();
    ListLinodes.linodesDisplay();
    testLinode = ListLinodes.linode[0]
      .$(ListLinodes.linodeLabel.selector)
      .getText();
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });

  describe('Search Displays Suite', () => {
    it('should display search elements on all routes', () => {
      const routes = [
        constants.routes.dashboard,
        constants.routes.linodes,
        constants.routes.volumes,
        constants.routes.nodeBalancers,
        constants.routes.domains,
        constants.routes.managed,
        constants.routes.longview,
        constants.routes.stackscripts,
        constants.routes.images,
        constants.routes.account.billing,
        constants.routes.account.users,
        constants.routes.profile.view,
        constants.routes.profile.tokens,
        constants.routes.profile.oauth,
        constants.routes.support.tickets
      ];

      routes.forEach(r => {
        console.log(`checking for search on ${r} page`);
        browser.url(r);
        SearchBar.assertSearchDisplays();
        console.log(`search found on ${r} page`);
      });
    });
  });

  it('should not display suggestions when no matching results found', () => {
    SearchBar.executeSearch('blahlblahblah');
    $('[data-qa-suggestion]').waitForDisplayed(constants.wait.short, true);
    $('body').click();
  });

  it('should display search suggestions on a legitimate search', () => {
    SearchBar.executeSearch(testLinode);
    SearchBar.assertSuggestions();
  });

  xit('should select result on arrow down', () => {
    if (!browser.options.capabilities.browserName.includes('chrome')) {
      pending();
    }
    SearchBar.selectByKeyDown();
  });

  it('should navigate to search results on enter', () => {
    if (!browser.options.capabilities.browserName.includes('chrome')) {
      pending();
    }

    browser.keys('\uE007');
    browser.waitUntil(function() {
      return browser.getUrl().includes('search?query=');
    }, constants.wait.normal);
  });

  it('should navigate to result on click', () => {
    browser.url(constants.routes.dashboard);
    const currentUrl = browser.getUrl();

    SearchBar.executeSearch(testLinode);
    $(SearchBar.suggestion.selector).waitForDisplayed(constants.wait.normal);
    browser.pause(2000);
    SearchBar.suggestions[0].click();

    browser.waitUntil(function() {
      return browser.getUrl() !== currentUrl;
    }, constants.wait.normal);
  });
});
