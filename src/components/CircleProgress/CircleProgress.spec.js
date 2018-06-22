const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Circle Progress Indicator Component Suite', () => {
    const component = 'Circle Progress Indicator';
    const childStory = [
        'Indefinite',
    ]

    beforeAll(() => {
        navigateToStory(component, childStory[0]);
    });

    it('should display indefinite progress indicator', () => {
        browser.waitForVisible('[data-qa-circle-progress]');

        const progressIndicator = $('[data-qa-circle-progress]');
        const role = progressIndicator.getAttribute('role');

        expect(role).toBe('progressbar');
        expect(progressIndicator.isVisible()).toBe(true)
    });

    it('should contain an svg child element', () => {
        const svg = $('[data-qa-circle-progress] > svg' );
        expect(svg.isVisible()).toBe(true);
    });

    it('should be indefinite variant', () => {
        const svgClasses = $('[data-qa-circle-progress] > svg' ).getAttribute('class');
    });
});
