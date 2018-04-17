const { waitForFocus, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Tags Suite', () => {
    const menuItem = '[data-name="Tags"]';
    const childStories = [
        '[data-name="primary"]', '[data-name="white"]',
        '[data-name="gray"]', '[data-name="lightGray"]',
        '[data-name="blue"]', '[data-name="lightBlue"]',
        '[data-name="green"]', '[data-name="lightGreen"]',
        '[data-name="yellow"]', '[data-name="lightYellow"]',
        '[data-name="editable"]',
    ];
    const tag = '[data-qa-tag]';

    it('should display tag component in navigation', () => {
        const tagNavItem = $(menuItem);
        expect(tagNavItem.isVisible()).toBe(true);
    });

    it('should display child stories in navigation', () => {
        browser.click(menuItem);
        childStories.forEach(story => expect($(story).isVisible()).toBe(true));
    });

    it('should display tag in each story', () => {
        executeInAllStories(childStories, () => {
            const tagElem = $(tag);
            expect(tagElem.isVisible()).toBe(true);
        });
    });

    describe('Editable Tag Suite', () => {
        beforeAll(() => {
           browser.click('[data-name="editable"]');
           waitForFocus(tag);
           browser.waitForVisible(tag);
        });

        it('should display a delete icon child element', () => {
            const svgIcon = $(`${tag} svg`);
            expect(svgIcon.isVisible()).toBe(true);
        });
    });
});
