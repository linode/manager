const { constants } = require('../../../e2e/constants');
const { waitForFocus } = require('../../../e2e/utils/storybook');

describe('Help Icon Component Suite', () => {
    const navItem = '[data-name="HelpIcon"]';
    const navChildren = [
        '[data-name="default"]',
        '[data-name="center"]',
        '[data-name="left"]',
        '[data-name="right"]' ];

    const helpButton = '[data-qa-help-button]';
    const popoverText = '[data-qa-popover-text]';
    
    it('should display help icon in the navigation', () => {
        const helpIcon = $(navItem);
        expect(helpIcon.isVisible()).toBe(true);
    });

    it('should display icon positioning stories', () => {
        browser.click(navItem);

        navChildren.forEach(e => expect(browser.isExisting(e)).toBe(true));
    });

    it('should display icon on the page', () => {
        navChildren.forEach(c => {
            browser.frame();
            browser.click(c);
            waitForFocus(helpButton);

            const buttonElement = $(helpButton);
            expect(buttonElement.isVisible()).toBe(true);
        });
    });

    it('should display popover text on click', () => {
        navChildren.forEach(c => {
            browser.frame();
            browser.click(c);
            waitForFocus(helpButton);

            browser.click(helpButton);
            const popOver = $(popoverText);
            expect(popOver.isVisible()).toBe(true);
            expect(popOver.getText()).toBe('There is some help text! Yada, yada, yada...');
        });
    });

    it('should hide popover text on outside click', () => {
        navChildren.forEach(c => {
            browser.frame();
            browser.click(c);
            waitForFocus(helpButton);

            browser.click(helpButton);
            const popOver = $(popoverText);
            expect(popOver.isVisible()).toBe(true);
            
            browser.jsClick(helpButton);
            waitForFocus(helpButton);
            const popOverTextHidden = browser.isVisible(popoverText);
            
            expect(popOverTextHidden).toBe(true);
        });
    });
});
