const { constants } = require('../../../e2e/constants');
const { waitForFocus } = require('../../../e2e/utils/storybook');

describe('Password Input Suite', () => {
    const menuItem = '[data-name="Password Input"]';
    const childMenuItem = '[data-name="Example"]';
    const strengthIndicator = '[data-qa-strength]';
    const passwordInput = '[data-qa-hide] input';

    function hideShow(show) {
        browser.click('[data-qa-hide] svg');
        const hidden = browser.getAttribute('[data-qa-hide]', 'data-qa-hide');
        const type = browser.getAttribute(passwordInput, 'type');
        
        if (show) {
            expect(hidden).toBe('false');
            expect(type).toBe('text');
        } else {
            expect(hidden).toBe('true');
            expect(type).toBe('password');
        }
    }

    it('should display password input in navigation', () => {
        const navItem = $(menuItem);
        expect(navItem.isVisible()).toBe(true);
    });

    it('should display Example story', () => {
        browser.click(menuItem);
        
        const exampleStory = $(childMenuItem);
        expect(exampleStory.isVisible()).toBe(true);
    });

    it('should display password input with strength indicator', () => {
        browser.click(childMenuItem);
        waitForFocus(passwordInput);

        const input = $(passwordInput);

        expect(input.isExisting()).toBe(true);
    });

    it('should update the strength when complexity of password increases', () => {
        const testPasswords = ['weak', 'stronger1233', 'Stronger123#!', 'StrongesT#123.Thing#24'];
        testPasswords.forEach((pass, index) => {
            browser.setValue(passwordInput, pass);
            const strengthDisplays = $(strengthIndicator).isVisible();
            const strength = $(strengthIndicator).getAttribute('data-qa-strength');

            expect(strengthDisplays).toBe(true);
            expect(parseInt(strength)).toBe(index + 1);
        });
    });

    it('should display password when click show', () => {
        hideShow(true);
    });

    it('should hide when click hide', () => {
        hideShow();
    });
});
