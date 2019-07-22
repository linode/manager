const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Error State Component Suite', () => {
    const component = 'Error Display';
    const childStories = [
        'with text'
    ]
    const icon = '[data-qa-error-icon="true"]';
    const errorMsg = '[data-qa-error-msg="true"]';

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display error state with text elements', () => {
        $(icon).waitForDisplayed();

        const errorIcon = $(icon);
        const errorText = $(errorMsg);

        expect(errorIcon.getTagName()).toBe('svg');
        expect(errorIcon.isDisplayed()).toBe(true);
        expect(errorText.getText()).toBe('An error has occurred.');
    });
});
