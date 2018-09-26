const { navigateToStory } = require('../../../e2e/utils/storybook');

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
        it('should display the placeholder text in the select', () => {
            
        });

        it('should display options on click', () => {
            
        });

        it('should update the select value on selection', () => {
            
        });
    });

    describe('Basic Select with Error Suite', () => {
        it('should display the error', () => {
            const errorMsg = "You didn't choose the correct fruit.";
        });
    });

    describe('Multi Select Suite', () => {
        
    });
    xit('should display placeholder text in the select', () => {
        selectElement = $('[data-qa-enhanced-select] input');
        expect(selectElement.getAttribute('placeholder')).toBe('Enter a value');
    });

    it('should display select options on click', () => {
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
