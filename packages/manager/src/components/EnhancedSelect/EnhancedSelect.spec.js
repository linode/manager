const { navigateToStory } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Enhanced Select Suite', () => {
    let selectElement, selectOptions;
    const component = 'Enhanced Select';
    const childComponents = ['Example'];

    beforeAll(() => {
        navigateToStory(component, childComponents[0]);
    });

    describe('Basic Select Suite', () => {
        let basicSelect, basicSelects, options;

        it('should display the placeholder text in the select', () => {
            basicSelects = $$('[data-qa-enhanced-select="Choose one fruit"]');
            let placeholderMsg = 'Choose one fruit';

            expect(basicSelects[0].getText()).toContain('Basic Select');
            expect(basicSelects[0].getText()).toContain(placeholderMsg);
        });

        it('should display options on click', () => {
            const basicSelectInputs = basicSelects.map((s) => s.$("div"));
            basicSelectInputs[0].click();
            browser.waitForVisible('[data-qa-option]', constants.wait.normal);

            options = $$('[data-qa-option]');
            expect(options.length).toBe(5);
        });

        it('should update the select value on selection', () => {
            const optionValue = options[0].getText();

            options[0].click();
            options[0].waitForVisible(constants.wait.normal, true);
            browser.waitForVisible(`[data-qa-enhanced-select="${optionValue}"]`, constants.wait.normal);
        });
    });

    describe('Basic Select with Error Suite', () => {
        it('should display the error', () => {
            const errorMsg = "You didn't choose the correct fruit.";
            const basicSelectWithError = $('[data-qa-enhanced-select="Choose one fruit"]');
            const error = basicSelectWithError.$$('p').filter(p => p.getText().includes(errorMsg));

            expect(error.length).toBe(1);
            expect(error[0].isVisible()).toBe(true);
        });
    });

    describe('Multi Select Suite', () => {
        let multiSelect, options, selectedOption;

        it('should display the multi select with placeholder text', () => {
            multiSelect = $('[data-qa-multi-select="Choose some fruit"]');
            expect(multiSelect.getText()).toBe('Choose some fruit');
        });

        it('should display options on click', () => {
            multiSelect.click();

            options = $$('[data-qa-option');
            expect(options.length).toBe(5);
        });

        it('should add a chip to the select on selection of an option', () => {
            selectedOption = options[0].getText();
            options[0].click();
            browser.waitForVisible(`[data-qa-multi-option="${selectedOption}"]`, constants.wait.normal);
        });

        it('should remove the chip from the select options', () => {
            browser.click('[data-qa-multi-option]');
            browser.waitForVisible('[data-qa-option]', constants.wait.normal);
            const remainingOptions = $$('[data-qa-option]').map(opt => opt.getText());

            expect(remainingOptions.length).toBe(4);
            expect(remainingOptions).not.toContain(selectedOption);
        });

        it('should remove the chip on click of the remove icon', () => {
            $(`[data-qa-multi-option="${selectedOption}"]`).$('..').$('svg').click();
            browser.waitForVisible(`[data-qa-multi-option="${selectedOption}"]`, constants.wait.true, true);
        });
    });

    describe('Creatable Select', () => {
        let creatableSelect, newOption;

        beforeAll(() => {
            // Close any potentially open select menus
            browser.click('body');
        });

        it('should display the creatable select with placeholder text', () => {
            creatableSelect = $('[data-qa-multi-select="Choose some timezones"]');

            expect(creatableSelect.isVisible()).toBe(true);
            expect(creatableSelect.getText()).toBe('Choose some timezones');
        });

        it('should display the create menu option', () => {
            newOption = 'foo';
            creatableSelect.$('..').$('input').setValue(newOption);

            expect($(`[data-qa-option="${newOption}"]`).isVisible()).toBe(true);
            expect($(`[data-qa-option="${newOption}"]`).getText()).toBe(`Create "${newOption}"`);
        });

        it('should add a created option to the select', () => {
            $(`[data-qa-option="${newOption}"]`).click();
            browser.waitForVisible(`[data-qa-multi-option=${newOption}]`, constants.wait.normal);
        });

        it('should select an already defined list option', () => {
            browser.click(`[data-qa-multi-option="${newOption}"]`);

            const optionToSelect = $$('[data-qa-option]');
            const optionName = optionToSelect[0].getText();
            optionToSelect[0].click();

            browser.waitForVisible(`[data-qa-multi-option="${optionName}"]`, constants.wait.normal);
        });

        it('should remove the created option on click of remove icon', () => {
            $(`[data-qa-multi-option="${newOption}"]`).$('..').$('svg').click();
            browser.waitForVisible(`[data-qa-multi-option="${newOption}"]`, constants.wait.normal, true);
        });
    });
});
