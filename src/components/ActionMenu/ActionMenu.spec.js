const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Action Menu Suite', () => {
    const component = 'Action Menu';
    const childStories = [
        'Action Menu',
        'Action Menu with disabled menu item %26 tooltip',
    ];
    const actionMenu = '[data-qa-action-menu]';
    const actionMenuItem = '[data-qa-action-menu-item]';

    it('should display action menu element', () => {
        executeInAllStories(component, childStories, () => {
            browser.waitForVisible(actionMenu);
        });
    });

    it('should display action menu items', () => {
        executeInAllStories(component, childStories, () => {
            browser.click(actionMenu);
            browser.waitForVisible(actionMenuItem);
            expect($$(actionMenuItem).length).toBeGreaterThan(1);
            $$(actionMenuItem).forEach(i => expect(i.getTagName()).toBe('li'));
        });
    });

    it('should close hide the menu items on select of an item', () => {
        navigateToStory(component, childStories[0]);
        browser.click(actionMenu);
        browser.waitForVisible(actionMenuItem);
        browser.click(actionMenuItem);
        browser.waitForVisible(actionMenuItem, 1000, true);
    });

    it('should display tooltip menu item', () => {
        navigateToStory(component, childStories[1]);

        const disabledMenuItem = '[data-qa-action-menu-item="Disabled Action"]';
        const tooltipIcon = '[data-qa-tooltip-icon]';
        const tooltip = '[data-qa-tooltip]';

        browser.waitForVisible(actionMenu);
        browser.click(actionMenu);
        
        $(disabledMenuItem).waitForVisible();
        expect($(disabledMenuItem).getAttribute('class')).toContain('disabled');

        expect($(tooltipIcon).isVisible()).toBe(true);
        browser.click(tooltipIcon);

        expect($(tooltipIcon).getTagName()).toBe('button');
        expect($(tooltip).getText()).toBe('An explanation as to why this item is disabled');
    });
});
