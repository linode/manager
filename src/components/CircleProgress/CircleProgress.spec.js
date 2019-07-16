const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Circle Progress Indicator Component Suite', () => {
    const component = 'Circle Progress Indicator';
    const childStory = [
        'Indefinite',
        'Data inside',
    ];

    describe('Indefinite Progress Suite', () => {
        beforeAll(() => {
            navigateToStory(component, childStory[0]);
        });

        it('should display indefinite progress indicator', () => {
            $('[data-qa-circle-progress]').waitForDisplayed();

            const progressIndicator = $('[data-qa-circle-progress]');
            const role = progressIndicator.getAttribute('role');

            expect(role).toBe('progressbar');
            expect(progressIndicator.isDisplayed()).toBe(true)
        });

        it('should contain an svg child element', () => {
            const svg = $('[data-qa-circle-progress] > svg' );
            expect(svg.isDisplayed()).toBe(true);
        });

        it('should be indefinite variant', () => {
            const svgClasses = $('[data-qa-circle-progress] > svg' ).getAttribute('class');
        });
    });

    describe('Data Inside Suite', () => {
        let progressBar;

        beforeAll(() => {
            navigateToStory(component, childStory[1]);
        });

        it('should display the data inside progress indicator', () => {
            $('[data-qa-circle-progress]').waitForDisplayed();
            progressbar = $('[data-qa-circle-progress]');

            expect(progressbar.getAttribute('data-qa-circle-progress')).toBe('50');
        });

        it('should display the progress label', () => {
            const labelText = 'Some data';

            expect($('[data-qa-progress-label]').getText()).toBe(labelText);
        });

        it('should display the progress bar as green', () => {
            const colorCode = 'rgb(0,177,89)';

            expect(progressbar.$('circle').getCSSProperty('stroke').value).toBe(colorCode);
        });
    });
});
