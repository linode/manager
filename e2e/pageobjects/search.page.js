import Page from './page';

class SearchBar extends Page {
    get searchElem() { return $('[data-qa-search]'); }
    get searchInput() { return $('[data-qa-search] input'); }
    get searchIcon() { return $('[data-qa-search-icon]'); }
    get suggestions() { return $$('[data-qa-suggestion]'); }
    get suggestionTitle() { return $('[data-qa-suggestion-title]'); }
    get suggestionDesc() { return $('[data-qa-suggestion-title]'); }

    executeSearch(query) {
        this.searchElem.waitForVisible();
        this.searchElem.click();
        this.searchInput.setValue(query);
    }

    assertSearchDisplays() {
        this.searchElem.waitForVisible();
        this.searchInput.waitForVisible();
        this.searchIcon.waitForVisible();
    }

    assertSuggestions() {
        browser.waitForVisible('[data-qa-suggestion]');

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
        browser.waitForVisible('[data-qa-suggestion]');

        suggestion.click();
        browser.waitForVisible('[data-qa-circle-progress]', 15000, true);
    }

    selectByKeyDown() {
        this.searchInput.setValue('\uE015');
        const selected = this.suggestions[0].hasFocus();
        expect(selected).toBe(true);
    }
}

export default new SearchBar();
