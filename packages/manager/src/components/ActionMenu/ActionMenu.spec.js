const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Action Menu Suite', () => {
    const component = 'Action Menu';
    const menuStories = [
        'Action Menu',
        'Action Menu with disabled menu item %26 tooltip',
    ];
    const singleItemStory = 'Action Menu with one menu item';
    const actionMenu = '[data-qa-action-menu]';
    const actionMenuItem = '[data-qa-action-menu-item]';
    const actionMenuSingleItem = '[data-qa-action-menu-link]';

    it('should display action menu element', () => {
        navigateToStory(component, menuStories, () => {
            browser.waitForVisible(actionMenu);
        });
    });

    it('should display action menu items', () => {
        executeInAllStories(component, menuStories, () => {
            browser.click(actionMenu);
            browser.waitForVisible(actionMenuItem);
            expect($$(actionMenuItem).length).toBeGreaterThan(1);
            $$(actionMenuItem).forEach(i => expect(i.getTagName()).toBe('li'));
        });
    });

    it('should hide the menu items on select of an item', () => {
        navigateToStory(component, menuStories[0]);
        browser.click(actionMenu);
        browser.waitForVisible(actionMenuItem);
        browser.click(actionMenuItem);
        browser.waitForVisible(actionMenuItem, 1000, true);
    });

    it('should display tooltip menu item', () => {
        navigateToStory(component, menuStories[1]);

        const disabledMenuItem = '[data-qa-action-menu-item="Disabled Action"]';
        const tooltipIcon = '[data-qa-tooltip-icon]';
        const tooltip = '[data-qa-tooltip]';

        browser.waitForVisible(actionMenu);
        browser.click(actionMenu);
        
        $(disabledMenuItem).waitForVisible();

        // HACK** REPLACE WITH ACTIONS API
        browser.moveToObject(tooltipIcon);

        expect($(disabledMenuItem).getAttribute('class')).toContain('disabled');
        expect($(tooltipIcon).isVisible()).toBe(true);
        expect($(tooltipIcon).getTagName()).toBe('button');
        expect($(tooltip).getText()).toBe('An explanation as to why this item is disabled');
    });

    // it('should display menu item as a link when only one menu item', () => {
    //     navigateToStory(component, singleItemStory);
    //     browser.waitForVisible(actionMenuSingleItem);

    //     const tagType = browser.getTagName(actionMenuSingleItem);
    //     const linkUrl = browser.getAttribute(actionMenuSingleItem, 'href');

    //     expect(linkUrl).toContain('iframe.html?selectedKind=Action%20Menu&selectedStory=Action%20Menu%20with%20one%20menu%20item#');
    //     expect(tagType).toBe('a');
    // });
});
