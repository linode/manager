const { constants } = require('../../../e2e/constants');
const { waitForFocus } = require('../../../e2e/utils/storybook');

describe('Icon Text Link Suite', () => {
    const checkboxParent = '[data-name="CheckBox"]';
    const parentMenuItem = '[data-name="IconTextLink"]';
    const childMenuItem = '[data-name="Interactive"]';
    const iconTextLinkTitle = '[data-qa-icon-text-link="Link title"]';

    it('should display icon text link in navigation', () => {
        const iconTextLink = $(parentMenuItem);
        expect(iconTextLink.isVisible()).toBe(true);
    });

    it('should display interactive in navigation', () => {
        browser.click(parentMenuItem);

        const interactive = $(childMenuItem);
        expect(interactive.isVisible()).toBe(true);
    });

    it('should display IconLinkText Components', () => {
        // First Hide expanded checkbox story
        browser.click(checkboxParent);

        // Wait until only one child menu displays before proceeding
        browser.waitUntil(function() {
            return $$(childMenuItem).length === 1;
        }, 5000);

        browser.click(childMenuItem);

        waitForFocus(iconTextLinkTitle);

        const iconTextLinks = $$(iconTextLinkTitle);
        iconTextLinks.forEach(e => expect(e.isVisible()).toBe(true));
    });

    it('should display IconTextLink with link text', () => {
        const iconTextLinks = $$(iconTextLinkTitle);

        iconTextLinks.forEach(e => expect(e.getTagName()).toBe('a'));
        iconTextLinks.forEach(e => expect(e.getText()).toMatch(/([A-Z])/ig));
    });

    it('should contain an svg icon', () => {
        const iconTextLinks = $$(iconTextLinkTitle);
        iconTextLinks.forEach(e => {
            expect(e.$('svg').isVisible()).toBe(true);
        });
    });

    it('should display a alert dialog on click', () => {
        const iconTextLinks = $$(iconTextLinkTitle);
        iconTextLinks[0].click();

        const alertMsg = browser.alertText();
        expect(alertMsg).toBe('thanks for clicking!');
    });

    it('should dismiss alert on click', () => {
        let alertDisplays = true;
        browser.alertDismiss();
        try {
            browser.alertText();
        } catch (err) {
            alertDisplays = false;
        }
        expect(alertDisplays).toBe(false);
    });

    it('should show a disabled IconTextLink', () => {
        waitForFocus(iconTextLinkTitle);

        const iconTextLinks = $$(iconTextLinkTitle);
        const disabledLinks = iconTextLinks.map(e => e.getAttribute('class').includes('disabled'));
        
        expect(disabledLinks).toContain(true);
    });
});
