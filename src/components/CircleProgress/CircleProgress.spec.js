const { constants } = require('../../../e2e/constants');
const { waitForFocus } = require('../../../e2e/utils/storybook');

describe('Circle Progress Indicator Component Suite', () => {
    it('should display circle progess Indicator in the navigation', () => {
        const navigationItem = $('[data-name="Circle Progress Indicator"]');
        expect(navigationItem.isVisible()).toBe(true);
    });

    it('should display indefinite story', () => {
        browser.click('[data-name="Circle Progress Indicator"]');
        waitForFocus('[data-name="Indefinite"]');

        const indefiniteStory = $('[data-name="Indefinite"]');
        expect(indefiniteStory.isVisible()).toBe(true);
    });

    it('should display indefinite progress indicator', () => {
        browser.click('[data-name="Indefinite"]');
        waitForFocus('[data-qa-circle-progress]');

        const progressIndicator = $('[data-qa-circle-progress]');
        const role = progressIndicator.getAttribute('role');

        expect(role).toBe('progressbar');
        expect(progressIndicator.isVisible()).toBe(true)
    });

    it('should contain an svg child element', () => {
        waitForFocus('[data-qa-circle-progress]');
        const svg = $('[data-qa-circle-progress] > svg' );
        expect(svg.isVisible()).toBe(true);
    });

    it('should be indefinite variant', () => {
        waitForFocus('[data-qa-circle-progress]');
        const svgClasses = $('[data-qa-circle-progress] > svg' ).getAttribute('class');
        expect(svgClasses).toContain('Indeterminate');
    });
});
