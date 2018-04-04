const { constants } = require('../../../e2e/constants');
const { waitForFocus } = require('../../../e2e/utils/storybook');

describe('Linear Progress Bar Suite', () => {
    const parentMenuItem = '[data-name="Linear Progress Indicator"]';
    const childMenuItem = '[data-name="Indefinite"]';
    const linearProgress = '[data-qa-linear-progress]';

    beforeAll(() => browser.url(constants.routes.storybook));

    it('should display linear progress bar story in navigation', () => {
        const progressMenuStory = $(parentMenuItem);
        expect(progressMenuStory.isVisible()).toBe(true);
    });

    it('should display the indefinite progress story in navigation', () => {
        browser.click(parentMenuItem);

        const indefinite = $(childMenuItem);
        expect(indefinite.isVisible()).toBe(true);
    });

    it('should display indefinite linear bar on the page', () => {
        browser.click(childMenuItem);

        waitForFocus(linearProgress);

        const progressBar = $(linearProgress);
        const role = progressBar.getAttribute('role');

        expect(progressBar.isVisible()).toBe(true);
        expect(role).toBe('progressbar');
    });
});