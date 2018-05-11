const { previewFocus } = require('../../../e2e/utils/storybook');

describe('Drawer Suite', () => {
    const menuItem = '[data-name="Drawer"]';
    const childStory = '[data-name="Example"]';
    const drawerElem = '[data-qa-drawer]';

    beforeAll(() => {
        browser.click(menuItem);
        browser.waitForVisible(childStory);
        browser.click(childStory);
        previewFocus();
    });

    it('should display the drawer on click', () => {
        browser.click('[data-qa-toggle-drawer]');
        browser.waitForVisible(drawerElem);
    });

    it('should display a title', () => {
        const title = $('[data-qa-drawer-title]');

        expect(title.isVisible()).toBe(true);
        expect(title.getText()).toBe('My Drawer');
    });

    it('should display an text field', () => {
       const textField = $('[data-qa-text-field]');
       
       expect(textField.isVisible()).toBe(true); 
    });

    it('should display save and cancel buttons', () => {
        const cancelButton = $('[data-qa-cancel]');
        const saveButton = $('[data-qa-save]');

        expect(cancelButton.isVisible()).toBe(true);
        expect(cancelButton.getAttribute('class')).toContain('Secondary');
        expect(saveButton.isVisible()).toBe(true);
        expect(saveButton.getAttribute('class')).toContain('Primary');
    });

    it('should dismiss drawer on close', () => {
        const close = $('[data-qa-close-drawer]');
        
        expect(close.isVisible()).toBe(true);
        
        close.click();
        browser.waitForVisible(drawerElem, 10000, true);
    });
});
