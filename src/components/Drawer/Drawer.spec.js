const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Drawer Suite', () => {
    const component = 'Drawer';
    const childStories = [
        'Example',
    ];
    const drawerElem = '[data-qa-drawer]';
    const toggleDrawer = '[data-qa-toggle-drawer]';

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display the drawer on click', () => {
        $(toggleDrawer).waitForDisplayed();
        $(toggleDrawer).click();
        $(drawerElem).waitForDisplayed();
    });

    it('should display a title', () => {
        const title = $('[data-qa-drawer-title]');

        expect(title.isDisplayed()).toBe(true);
        expect(title.getText()).toBe('My Drawer');
    });

    it('should display an text field', () => {
       const textField = $('[data-qa-text-field]');
       
       expect(textField.isDisplayed()).toBe(true); 
    });

    it('should display save and cancel buttons', () => {
        const cancelButton = $('[data-qa-cancel]');
        const saveButton = $('[data-qa-save]');

        expect(cancelButton.isDisplayed()).toBe(true);
        expect(cancelButton.getAttribute('class')).toContain('Secondary');
        expect(saveButton.isDisplayed()).toBe(true);
        expect(saveButton.getAttribute('class')).toContain('Primary');
    });

    it('should dismiss drawer on close', () => {
        const close = $('[data-qa-close-drawer]');
        
        expect(close.isDisplayed()).toBe(true);
        
        close.click();
        $(drawerElem, 10000, true).waitForDisplayed();
    });

    it('should dismiss on esc', () => {
        $(toggleDrawer).click(toggleDrawer);
        $(drawerElem).waitForDisplayed(drawerElem);
        $('[data-qa-text-field]').click();
        $('[data-qa-text-field] input', '\uE00C').setValue();
        $(drawerElem, 10000, true).waitForDisplayed();
    });
});
