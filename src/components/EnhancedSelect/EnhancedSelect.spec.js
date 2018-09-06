const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Enhanced Select Suite', () => {
    let selectElement, selectOptions;
    const component = 'Enhanced Select';
    const childComponents = ['Example'];

    beforeAll(() => {
        navigateToStory(component, childComponents[0]);
        browser.waitForVisible('[data-qa-enhanced-select]');
    });

    xit('should display placeholder text in the select', () => {
        selectElement = $('[data-qa-enhanced-select] input');
        expect(selectElement.getAttribute('placeholder')).toBe('Enter a value');
    });

    xit('should display select options on click', () => {
        selectElement.click();
        browser.waitForVisible('[data-qa-select-menu-item]');
    });

    xit('should select an option on click', () => {
        selectOptions = $$('[data-qa-select-menu-item]');
        selectOptions[0].click();
        expect(selectElement.getValue()).toBe('Apple');
    });

    xit('should display only the matching option', () => {
        selectElement.setValue('Pea');
        const menuItems = $$('[data-qa-select-menu-item]');
        expect(menuItems.length).toBe(1);
    });
});
