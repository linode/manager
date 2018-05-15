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
        browser.waitForVisible(toggleDrawer);
        browser.click(toggleDrawer);
        browser.waitForVisible(drawerElem);
    });

    it('should display a title', () => {
        const title = $('[data-qa-drawer-title]');

        expect(title.isVisible()).toBe(true);
        expect(title.getText()).toBe('My Drawer');
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

    xit('should dismiss on esc', () => {
        browser.click(toggleDrawer);
        browser.waitForVisible(drawerElem);
        browser.waitForVisible(drawerElem, 10000, true);
    });
});
