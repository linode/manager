const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Icon Text Link Suite', () => {
    const component = 'IconTextLink';
    const childStories = [
        'Interactive',
    ]
    const iconTextLinkTitle = '[data-qa-icon-text-link="Link title"]';

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display IconLinkText Components', () => {
        $(iconTextLinkTitle).waitForDisplayed();

        const iconTextLinks = $$(iconTextLinkTitle);
        iconTextLinks.forEach(e => expect(e.isDisplayed()).toBe(true));
    });

    it('should display IconTextLink with link text', () => {
        const iconTextLinks = $$(iconTextLinkTitle);

        iconTextLinks.forEach(e => expect(e.getTagName()).toBe('button'));
        iconTextLinks.forEach(e => expect(e.getText()).toMatch(/([A-Z])/ig));
    });

    it('should contain an svg icon', () => {
        const iconTextLinks = $$(iconTextLinkTitle);
        iconTextLinks.forEach(e => {
            expect(e.$('svg').isDisplayed()).toBe(true);
        });
    });

    it('should display a alert dialog on click', () => {
        const iconTextLinks = $$(iconTextLinkTitle);
        iconTextLinks[0].click();

        const alertMsg = browser.getAlertText();
        expect(alertMsg).toBe('thanks for clicking!');
    });

    it('should dismiss alert on click', () => {
        let alertDisplays = true;
        browser.dismissAlert();
        try {
            browser.getAlertText();
        } catch (err) {
            alertDisplays = false;
        }
        expect(alertDisplays).toBe(false);
    });

    it('should show a disabled IconTextLink', () => {
        $(iconTextLinkTitle).waitForDisplayed();

        const iconTextLinks = $$(iconTextLinkTitle);
        const disabledLinks = iconTextLinks.map(e => e.getAttribute('class').includes('disabled'));

        expect(disabledLinks).toContain(true);
    });
});
