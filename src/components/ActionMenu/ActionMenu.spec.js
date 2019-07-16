const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Action Menu Suite', () => {
    const component = 'Action Menu';
    const menuStories = [
        'Action Menu',
        'Action Menu with disabled menu item %26 tooltip',
    ];
    const actionMenu = '[data-qa-action-menu]';
    const actionMenuItem = '[data-qa-action-menu-item]';

    it('should display action menu element', () => {
        navigateToStory(component, menuStories, () => {
            $(actionMenu).waitForDisplayed();
        });
    });

    it('should display action menu items', () => {
        executeInAllStories(component, menuStories, () => {
            $(actionMenu).click();
            $(actionMenuItem).waitForDisplayed();
            expect($$(actionMenuItem).length).toBeGreaterThan(1);
            $$(actionMenuItem).forEach(i => expect(i.getTagName()).toBe('li'));
        });
    });

    it('should hide the menu items on select of an item', () => {
        navigateToStory(component, menuStories[0]);
        $(actionMenu).click();
        $(actionMenuItem).waitForDisplayed();
        $(actionMenuItem).click();
        $(actionMenuItem).waitForExist(3000, true);
        
    });

    it('should display tooltip menu item', () => {
        navigateToStory(component, menuStories[1]);

        const disabledMenuItem = '[data-qa-action-menu-item="Disabled Action"]';
        const tooltipIcon = '[data-qa-tooltip-icon]';
        const tooltip = '[data-qa-tooltip]';

        $(actionMenu).waitForDisplayed();
        $(actionMenu).click();
        
        $(disabledMenuItem).waitForDisplayed();
        $(tooltipIcon).click();
        $(tooltip).waitForDisplayed();
        expect($(tooltip).getText()).toBe('An explanation as to why this item is disabled');
        expect($(disabledMenuItem).getAttribute('class')).toContain('disabled');
        expect($(tooltipIcon).isDisplayed()).toBe(true);
        expect($(tooltipIcon).getTagName()).toBe('button');
    });
});
