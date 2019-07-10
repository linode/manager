const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Debounced Search Suite', () => {
    const component = 'Debounced Search';
    const childStories = ['Select Field', 'Text Field'];

    describe('Select Field Suite', () => {
        let selectedOptionMsg, selectOptions;

        const placeholderMsg = 'Search for something (i.e "er")';
        const enhancedSelect = `[data-qa-enhanced-select]`;
        const enhancedSelectInput = `[data-qa-enhanced-select] input`;
        const currentResultSelector = '[data-qa-selected-result]';
        const optionSelector = '[data-qa-option]';
        const emptyResult = 'You selected:';
        const validQuery = 'keyboard';

        beforeAll(() => {
            navigateToStory(component, childStories[0]);
        });

        it('should display select search bar', () => {
            console.log('checking for select search bar and placeholder text')
            expect($(enhancedSelect).isDisplayed()).toBe(true);
            expect($(enhancedSelect).getText()).toContain(placeholderMsg)
            console.log('select search bar and placeholder text found')
        });

        it('should not have options selected on pageload', () => {
            selectedOptionMsg = $(currentResultSelector);
            console.log('checking for empty results')
            expect(selectedOptionMsg.getText()).toBe(emptyResult);
            console.log('no results found')
        });

        it('should display no options on a bad search query', () => {
            const badQuery = 'akjsdhfklj';
            console.log('checking for bad search query')
            $(enhancedSelectInput).setValue(badQuery);
            $('[data-qa-no-options]', constants.wait.normal).waitForDisplayed();
            console.log('bad search query returns no results')
        });

        it('should display options on a valid search query', () => {
            // Add the value twice to fix test flakiness when running the entire functional test suite
            console.log(`Setting value ${validQuery}`)
            $(enhancedSelectInput).setValue(validQuery);
            console.log(`${validQuery} entered\n      waiting for options`)
            $(optionSelector, constants.wait.normal).waitForDisplayed();
            
            selectOptions = $$(optionSelector);
            expect(selectOptions.length).toBe(1);
        });

        it('should update the selected option text on select', () => {
            $(enhancedSelectInput).setValue('apples');
            $(optionSelector, constants.wait.normal).waitForDisplayed();
            $(optionSelector).click();
            
            selectedOptionMsg = $(currentResultSelector);
            expect(selectedOptionMsg.getText()).toBe('You selected: apples');
        });
    });

    describe('Text Field Suite', () => {
        let searchTextfield,
            displayedListItems,
            initialOptions = [];

        const debouncedSearchSelector = '[data-qa-debounced-search]';
        const listItemSelector = '[data-qa-list-item]';
        const validQuery = 'apples';
        const mainList = '[data-qa-listOfItems]'

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
                expect(i.isDisplayed()).toBe(true);
                expect(i.getText()).toMatch(/\w/ig);
                initialOptions.push(i.getText());
            });
        });

        it('should display no options on a bad search query', () => {
            const badQuery = 'lkajsdkhsdklf';
            console.log(`setting bad query of: ${badQuery}`)
            searchTextfield.setValue(badQuery);
            expect(searchTextfield.getText() === badQuery)
            console.log(`bad query of ${badQuery} has been set`)
            $(mainList + ' li').waitForDisplayed(constants.wait.normal, true);
        });

        it('should display a single option on query of a single matching list item', () => {
            searchTextfield = '[data-qa-debounced-search] input';
            console.log(`looking for single option in list`)
            $(searchTextfield).clearValue()
            console.log(`setting a valid query: ${validQuery}`)
            $(searchTextfield).setValue(validQuery)
            console.log(`waiting for list to be displayed`)
            browser.waitUntil(() => {
                displayedListItems = $$(listItemSelector);
                return displayedListItems.length === 1;
            }, constants.wait.normal);
            console.log(`checking for ${validQuery} to be in selected`)
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
