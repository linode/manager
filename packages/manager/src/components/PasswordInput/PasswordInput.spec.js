const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Password Input Suite', () => {
    const component = 'Password Input';
    const childStories = [
        'Example',
    ]
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

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display password input with strength indicator', () => {
        browser.waitForVisible(passwordInput);

        const input = $(passwordInput);

        expect(input.isExisting()).toBe(true);
    });

    it('should update the strength when complexity of password increases', () => {
        const testPasswords = ['weak', 'stronger1233', 'Stronger123#!'];
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
