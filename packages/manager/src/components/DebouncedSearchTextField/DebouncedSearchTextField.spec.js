const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Debounced Search Suite', () => {
    const component = 'Debounced Search';
    const childStories = ['Select Field', 'Text Field'];

    describe('Select Field Suite', () => {
        let enhancedSelect, selectedOptionMsg, selectOptions;

        const currentResultSelector = '[data-qa-selected-result]';
        const optionSelector = '[data-qa-option]';
        const emptyResult = 'You selected:';
        const validQuery = 'keyboard';

        beforeAll(() => {
            navigateToStory(component, childStories[0]);
        });

        it('should display select search bar', () => {
            const placeholderMsg = 'Search for something (i.e "er")'
            enhancedSelect = $(`[data-qa-enhanced-select='${placeholderMsg}']`);

            expect(enhancedSelect.isVisible()).toBe(true);
            expect(enhancedSelect.getText()).toContain(placeholderMsg)
        });

        it('should not have options selected on pageload', () => {
            selectedOptionMsg = $(currentResultSelector);

            expect(selectedOptionMsg.getText()).toBe(emptyResult);
        });

        it('should display no options on a bad search query', () => {
            const badQuery = 'akjsdhfklj';

            enhancedSelect.$('..').$('input').setValue(badQuery);
            browser.waitForVisible('[data-qa-no-options]', constants.wait.normal);
        });

        it('should display options on a valid search query', () => {
            // Add the value twice to fix test flakiness when running the entire functional test suite
            const enhancedSelectInput = enhancedSelect.$('..').$('input').selector;
            browser.trySetValue(enhancedSelectInput, validQuery);

            browser.waitForVisible(optionSelector, constants.wait.normal);

            selectOptions = $$(optionSelector);
            expect(selectOptions.length).toBe(1);
        });

        it('should update the selected option text on select', () => {
            selectOptions[0].click();

            browser.waitForVisible(selectOptions[0].selector, constants.wait.normal, true);
            selectedOptionMsg = $(currentResultSelector);
            expect(selectedOptionMsg.getText()).toBe('You selected: keyboards');
        });

        xit('should clear the result on click clear', () => {
            validQuery.split('').forEach(i => {
                enhancedSelect.$('..').$('input').addValue('\uE003');
            });

            browser.waitUntil(() => {
                return $(currentResultSelector).getText() === emptyResult;
            }, constants.wait.normal);
        });
    });

    describe('Text Field Suite', () => {
        let searchTextfield,
            displayedListItems,
            initialOptions = [];

        const debouncedSearchSelector = '[data-qa-debounced-search]';
        const listItemSelector = '[data-qa-list-item]';
        const validQuery = 'apples';

        beforeAll(() => {
            navigateToStory(component, childStories[1]);
        });

        it('should display the debounced search text field', () => {
            const placeholderMsg = 'Search for something';
            searchTextfield = $(debouncedSearchSelector).$('input');

            expect(searchTextfield.getAttribute('placeholder')).toBe(placeholderMsg);
        });

        it('should display unfiltered list of options', () => {
            displayedListItems = $$(listItemSelector);
            displayedListItems.forEach(i => {
                expect(i.isVisible()).toBe(true);
                expect(i.getText()).toMatch(/\w/ig);
                initialOptions.push(i.getText());
            });
        });

        it('should display no options on a bad search query', () => {
            const badQuery = 'lkajsdkhsdklf';

            searchTextfield.setValue(badQuery);

            displayedListItems.forEach(i => i.waitForVisible(constants.wait.normal, true));
        });

        it('should display a single option on query of a single matching list item', () => {
            searchTextfield.setValue(validQuery);

            browser.waitUntil(() => {
                displayedListItems = $$(listItemSelector);
                return displayedListItems.length === 1;
            }, constants.wait.normal);

            expect(displayedListItems[0].getText()).toBe(validQuery);
        });

        it('should display all list options on clear', () => {
            validQuery.split('').forEach(i => {
                $(debouncedSearchSelector).$('input').addValue('\uE003');
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
