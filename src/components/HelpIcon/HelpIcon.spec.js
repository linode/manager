const { executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Help Icon Component Suite', () => {
    const component = 'HelpIcon';
    const childStories = [
        'default',
        'center',
        'left',
        'right',
    ]

    const helpButton = '[data-qa-help-button]';
    const popoverText = '[data-qa-popover-text]';
    
    it('should display icon on the page', () => {
        executeInAllStories(component, childStories, () => {
            browser.waitForVisible(helpButton);
        });
    });

    it('should display popover text on click', () => {
        executeInAllStories(component, childStories, () => {
            browser.waitForVisible(helpButton);

            browser.click(helpButton);
            const popOver = $(popoverText);

            expect(popOver.isVisible()).toBe(true);
            expect(popOver.getText()).toBe('There is some help text! Yada, yada, yada...');
        });
    });

    it('should hide popover text on outside click', () => {
        executeInAllStories(component, childStories, () => {
            browser.waitForVisible(helpButton);

            browser.click(helpButton);
            const popOver = $(popoverText);
            expect(popOver.isVisible()).toBe(true);
            
            browser.jsClick(helpButton);

            browser.waitForVisible(helpButton);
            const popOverTextHidden = browser.isVisible(popoverText);
            
            expect(popOverTextHidden).toBe(true);
        });
    });
});
