const { constants } = require('../constants');

import Page from './page';

class SearchBar extends Page {
    get searchElem() { return $('#search-bar'); }
    get searchInput() { return $('#search-bar input'); }
    get searchIcon() { return $('[data-qa-search-icon]'); }
    get suggestion() { return $('[data-qa-suggestion]'); }
    get suggestions() { return $$(this.suggestion.selector); }
    get suggestionTitle() { return $('[data-qa-suggestion-title]'); }
    get suggestionDesc() { return $('[data-qa-suggestion-title]'); }

    executeSearch(query) {
        this.searchElem.waitForVisible(constants.wait.normal);
        this.searchElem.click();
        this.searchInput.setValue(query);
    }

    searchAndNavigateToResults(query){
        this.executeSearch(query);
        this.suggestion.waitForVisible(constants.wait.normal);
        this.searchInput.addValue(this.enterKey);
    }

    assertSearchDisplays() {
        this.searchIcon.waitForVisible(constants.wait.normal);
        this.searchElem.waitForVisible(constants.wait.normal);
        this.searchInput.waitForVisible(constants.wait.normal);
    }

    assertSuggestions() {
        browser.waitForVisible('[data-qa-suggestion]', constants.wait.normal);

        // Assert suggestions display icons, titles, descriptions
        this.suggestions
            .forEach(el => {
                const iconVisible = el.$('svg').isVisible();
                const titleVisible = el.$(this.suggestionTitle.selector).isVisible();
                const descriptionVisible = el.$(this.suggestionDesc.selector).isVisible();

                expect(iconVisible).toBe(true);
                expect(titleVisible).toBe(true);
                expect(descriptionVisible).toBe(true)
            });
    }

    navigateToSuggestion(suggestion) {
        browser.waitForVisible('[data-qa-suggestion]', constants.wait.normal);

        suggestion.click();
        browser.waitForVisible('[data-qa-circle-progress]', constants.wait.normal, true);
    }

    selectByKeyDown() {
        this.searchInput.setValue('\uE015');

        browser.waitForVisible('[data-qa-suggestion]', constants.wait.normal);
        // key down and enter fails to work on firefox
        const selected = this.suggestions[0].getAttribute('data-qa-selected');
        expect(selected).toBe('true');
    }
}

export default new SearchBar();
