const { constants } = require('../../../e2e/constants');
const { waitForFocus } = require('../../../e2e/utils/storybook');

describe('Checkbox Component Suite', () => {
    beforeAll(() => {
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
        const initialChecked = $$('[data-qa-checked="true"]');
        const enabledCheckboxes = $$('[data-qa-checked]').filter(e => !e.getAttribute('class').includes('disabled'));
        enabledCheckboxes.forEach(e => e.click());

        waitForFocus('[data-qa-checked]');

        const updatedCheckboxValues = $$('[data-qa-checked="true"]');
        
        expect(updatedCheckboxValues.length).toBe(initialChecked.length + enabledCheckboxes.length);
    });

    it('should uncheck on click', () => {
        const enabledAndChecked = $$('[data-qa-checked="true"]').filter(e => !e.getAttribute('class').includes('disabled'));

        enabledAndChecked.forEach(e => e.click());

        waitForFocus('[data-qa-checked]');
        const updatedCheckboxValues = $$('[data-qa-checked="true"]').filter(e => !e.getAttribute('class').includes('disabled'));

        expect(updatedCheckboxValues).toEqual([]);
    });

    it('should display different variants of checkboxes', () => {
        const checkboxes = $$('[data-qa-checked]');
        waitForFocus('[data-qa-checked]');

        const variants = checkboxes.map(e => e.getAttribute('variant'));
        
        expect(variants).toContain('warning');
        expect(variants).toContain('error');
    });

    it('should not update values of disabled checked boxes', () => {
        const checkedDisabledBoxes = $$('[data-qa-checked="true"]').filter(e => e.getAttribute('class').includes('disabled'));

        // Click on all checked disabled boxes
        // Use jsClickAll to avoid other element would receive click error
        waitForFocus('[data-qa-checked]');
        browser.jsClickAll('[data-qa-checked="true"]:disabled');

        waitForFocus('[data-qa-checked]');

        const afterClick = $$('[data-qa-checked="true"]').filter(e => e.getAttribute('class').includes('disabled'));
        expect(afterClick.length).toBe(checkedDisabledBoxes.length);
    });

    it('should not update the values of disabled unchecked boxes', () => {
        const disabledUnchecked = $$('[data-qa-checked="false"]').filter(e => e.getAttribute('class').includes('disabled'));
        
        // Click on all unchecked disabled boxes
        // Use jsClickAll to avoid other element would receive click error
        browser.jsClickAll('[data-qa-checked="false"]:disabled');

        waitForFocus('[data-qa-checked]');

        const afterClick = $$('[data-qa-checked="false"]').filter(e => e.getAttribute('class').includes('disabled'));

        expect(afterClick.length).toBe(afterClick.length);
    });
});
