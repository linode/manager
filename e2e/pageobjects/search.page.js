const { constants } = require('../constants');

import Page from './page';

class SearchBar extends Page {
    get searchElem() { return $('[data-qa-search]'); }
    get searchInput() { return $('[data-qa-search] input'); }
    get searchIcon() { return $('[data-qa-search-icon]'); }
    get suggestions() { return $$('[data-qa-suggestion]'); }
    get suggestionTitle() { return $('[data-qa-suggestion-title]'); }
    get suggestionDesc() { return $('[data-qa-suggestion-title]'); }

    executeSearch(query) {
        this.searchElem.waitForVisible(constants.wait.normal);
        this.searchElem.click();
        browser.trySetValue('[data-qa-search] input', query);
    }

    assertSearchDisplays() {
        this.searchElem.waitForVisible(constants.wait.normal);
        this.searchInput.waitForVisible(constants.wait.normal);
        this.searchIcon.waitForVisible(constants.wait.normal);
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
        if (browser.options.desiredCapabilities.browserName.includes('chrome')) {
            this.searchInput.setValue('\uE015');
        } else {
            browser.keys('ArrowDown');
        }
        browser.waitForVisible('[data-qa-suggestion]', constants.wait.normal);
        // key down and enter fails to work on firefox
        const selected = this.suggestions[0].getAttribute('data-qa-selected');
        expect(selected).toBe('true');
    }
}

export default new SearchBar();
