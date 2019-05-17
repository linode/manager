const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Error State Component Suite', () => {
    const component = 'Error Display';
    const childStories = [
        'with text'
    ]
    const icon = '[data-qa-error-icon]';
    const errorMsg = '[data-qa-error-msg]';

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display error state with text elements', () => {
        browser.waitForVisible('[data-qa-error-icon]');

        const errorIcon = $(icon);
        const errorText = $(errorMsg);

        expect(errorIcon.getTagName()).toBe('svg');
        expect(errorIcon.isVisible()).toBe(true);
        expect(errorText.getText()).toBe('An error has occured.');
    });
});
