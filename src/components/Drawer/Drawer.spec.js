const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Drawer Suite - ', () => {
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
        expect($(toggleDrawer).waitForDisplayed())
        .withContext('Drawer toggle link should be displayed').toBe(true);
        $(toggleDrawer).click();
        expect($(drawerElem).waitForDisplayed())
        .withContext(`Drawer should be expanded and displayed`).toBe(true);
    });

    it('should display a title', () => {
        const title = $('[data-qa-drawer-title]');

        expect(title.isDisplayed())
        .withContext(`Drawer title should be displayed`).toBe(true);
        expect(title.getText())
        .withContext(`Drawer title is not correct`).toBe('My Drawer');
    });

    it('should display a text field', () => {
       const textField = $('[data-qa-text-field]');
       
       expect(textField.isDisplayed())
       .withContext(`Text field should be displayed`).toBe(true); 
    });

    it('should display save and cancel buttons', () => {
        const cancelButton = $('[data-qa-cancel]');
        const saveButton = $('[data-qa-save]');

        expect(cancelButton.isDisplayed())
        .withContext(`Cancel button should be displayed`).toBe(true);
        expect(cancelButton.getAttribute('class'))
        .withContext(`Incorrect Cancel button class`).toContain('Secondary');
        expect(saveButton.isDisplayed())
        .withContext(`Save button should be displayed`).toBe(true);
        expect(saveButton.getAttribute('class'))
        .withContext(`Incorrect Save button class`).toContain('Primary');
    });

    it('should dismiss drawer on close', () => {
        const close = $('[data-qa-close-drawer]');
        
        expect(close.isDisplayed())
        .withContext(`Close icon should be displayed`).toBe(true);
        close.click();
        expect($(drawerElem).waitForDisplayed(10000, true))
        .withContext(`Drawer should not be displayed when selecting 'close' icon`);
    });

    it('should dismiss on esc', () => {
        $(toggleDrawer).click();
        $(drawerElem).waitForDisplayed(drawerElem);
        $('[data-qa-text-field]').click();
        browser.keys('\uE00C');
        expect($(drawerElem).waitForDisplayed(10000, true))
        .withContext(`Drawer should not be displayed when using escape key`).toBe(true);
    });
});
