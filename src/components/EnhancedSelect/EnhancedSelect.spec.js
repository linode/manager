const { navigateToStory } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Enhanced Select Suite', () => {
    let selectElement, selectOptions;
    const component = 'Enhanced Select';
    const childComponents = ['Example'];

    beforeAll(() => {
        navigateToStory(component, childComponents[0]);
        browser.waitForVisible('[data-qa-enhanced-select]');
        browser.waitForVisible('[data-qa-multi-select]');
    });

    describe('Basic Select Suite', () => {
        let basicSelect, options;

        it('should display the placeholder text in the select', () => {
            basicSelects = $$('[data-qa-enhanced-select="Choose one fruit"]');
            const placeholderMsg = 'Choose one fruit';

            expect(basicSelects[0].getText()).toContain('Basic Select');
            expect(basicSelects[0].getText()).toContain(placeholderMsg);
        });

        it('should display options on click', () => {
            basicSelects[0].click();
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

    xdescribe('Basic Select with Error Suite', () => {
        it('should display the error', () => {
            const errorMsg = "You didn't choose the correct fruit.";
        });
    });

    xdescribe('Multi Select Suite', () => {
        
    });
    xit('should display placeholder text in the select', () => {
        selectElement = $('[data-qa-enhanced-select] input');
        expect(selectElement.getAttribute('placeholder')).toBe('Enter a value');
    });

    xit('should display select options on click', () => {
        selectElement.click();
        browser.debug();
        browser.waitForVisible('[data-qa-option]');
    });

    xit('should select an option on click', () => {
        selectOptions = $$('[data-qa-option]');
        selectOptions[0].click();
        expect(selectElement.getValue()).toBe('Apple');
    });

    xit('should display only the matching option', () => {
        selectElement.setValue('Pea');
        const menuItems = $$('[data-qa-option]');
        expect(menuItems.length).toBe(1);
    });
});
