const { constants } = require('../../../e2e/constants');
const { waitForFocus } = require('../../../e2e/utils/storybook');

describe('Checkbox Component Suite', () => {
    beforeAll(() => {
        browser.url('/');
        browser.waitForVisible('html body div#root div div div.SplitPane.vertical div.Pane.vertical.Pane1 div div div div a h3');
    });

    it('should display checkbox component in navigation', () => {
        const checkboxNavItem = $('[data-name="CheckBox"]');
        expect(checkboxNavItem.getText()).toBe('CheckBox');
    });

    it('should have an interactive story', () => {
        $('[data-name="CheckBox"]').click();
        const interactive = $('[data-name="Interactive"]');
        expect(interactive.getText()).toBe('Interactive');
    });

    it('should display checkboxes on interactive story', () => {
        waitForFocus('[data-qa-checked]');
        const checkboxes = $$('[data-qa-checked]'); 
        checkboxes.forEach(e => expect(e.isVisible()).toBe(true));
    });

    it('should check on click', () => {
        browser.jsClickAll('[data-qa-checked] input');

        waitForFocus('[data-qa-checked]');

        const updatedCheckboxValues = $$('[data-qa-checked]');
        const boxValues = updatedCheckboxValues.map(e => e.getAttribute('data-qa-checked') == 'true');
        
        expect(boxValues).toContain(true);
        expect(boxValues.length).toBeGreaterThanOrEqual(1);
    });

    it('should uncheck on click', () => {
        browser.jsClickAll('[data-qa-checked] input');

        waitForFocus('[data-qa-checked]');
        const updatedCheckboxValues = $$('[data-qa-checked]');
        const boxValues = 
            updatedCheckboxValues
                .map(e => e.getAttribute('data-qa-checked') == false)
                .forEach( e => expect(e).toBe(false));
    });

    it('should display disabled boxes', () => {
        waitForFocus('[data-qa-checked]');

        const boxes = $$('[data-qa-checked]');
        const numberDisabledBoxes = boxes.map(e => e.getAttribute('class').includes('disabled'));
        expect(numberDisabledBoxes).toContain(true);
    });


    it('should display different variants of checkboxes', () => {
        waitForFocus('[data-qa-checked]');

        const checkboxes = $$('[data-qa-checked]');
        const variants = checkboxes.map(e => e.getAttribute('variant'));
        expect(variants).toContain('warning');
        expect(variants).toContain('error');
    });
});
