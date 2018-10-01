const { constants } = require('../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../utils/common';
import SearchBar from '../../pageobjects/search.page';

describe('Search - Tags Suite', () => {
    const tags = ['foo', 'bar'];
    const linodeLabel = `L${new Date().getTime()}`;
    let linodeConfig;

    beforeAll(() => {
        linodeConfig = apiCreateLinode(linodeLabel, false, tags);
        browser.url(constants.routes.dashboard);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('should display linode when searching for each tag', () => {
        tags.forEach(t => {
            SearchBar.executeSearch(t);
            SearchBar.assertSuggestions();
            
            const suggestionTitle = SearchBar.suggestionTitle.getText();
            const tagTitle = SearchBar.tag.getText();

            expect(tagTitle).toContain(t);
            expect(suggestionTitle).toBe(linodeLabel);
        });
    });

    it('should route to the linode detail on click', () => {
        SearchBar.suggestions[0].click();
        browser.waitUntil(function() {
            return browser.getUrl().includes(linodeConfig.id);
        }, constants.wait.normal);
    });
});
