const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Error State Component Suite', () => {
    const component = 'Error Display';
    const childStories = [
        'with text'
    ]
    const icon = '[data-qa-error-icon="true"]';
    const errorMsg = '[data-qa-error-msg="true"]';
    const fontValues = { property: 'font', value: 'normal normal 400 normal 16px / 22.4px latowebbold, sans-serif' }

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display error state with text elements', () => {
        $(icon).waitForDisplayed();

        const errorIcon = $(icon);
        const errorText = $(errorMsg);

        expect(errorIcon.getTagName())
          .withContext(`Incorrect tag name`).toBe('svg');
        expect(errorIcon.isDisplayed())
          .withContext(`Error icon should have been displayed`).toBe(true);
        expect(errorText.getText())
          .withContext(`Incorrect error text`).toBe('An error has occurred.');
        expect(errorText.getAttribute('style'))
          .withContext(`Style should be centered`).toBe(`text-align: center;`);
        expect(errorText.getCSSProperty('font'))
          .withContext(`Incorrect font value(s)`).toEqual(fontValues);
    });
});
