const { constants } = require('../../../e2e/constants');
const { waitForFocus } = require('../../../e2e/utils/storybook');

describe('Error State Component Suite', () => {
    const navItem = '[data-name="Error Display"]';
    const navChild = '[data-name="with text"]';
    const icon = '[data-qa-error-icon]';
    const errorMsg = '[data-qa-error-msg]';

    it('should display error states in the navigation', () => {
        const errorState = $(navItem);
        expect(errorState.isVisible()).toBe(true);
    });

    it('should display error state "with text" story', () => {
        browser.click(navItem);
        const withTextStory = $(navChild);
        expect(withTextStory.isVisible()).toBe(true);
    });

    it('should display error state with text elements', () => {
        browser.click(navChild);

        waitForFocus('[data-qa-error-icon]');

        const errorIcon = $(icon);
        const errorText = $(errorMsg);

        expect(errorIcon.isVisible()).toBe(true);
        expect(errorText.getText()).toBe('An error has occured.');
    });
});
