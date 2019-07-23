const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Show More Expansion Suite', () => {
    const component = 'ShowMoreExpansion';
    const childStories = [
        'default',
    ]
    const showMoreExpanded = '[data-qa-show-more-expanded]';
    const showMoreToggle = '[data-qa-show-more-toggle]';

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display show more expansion', () => {
        browser.waitForVisible(showMoreExpanded);

        const showMoreExpandedElem = $(showMoreExpanded);

        expect(showMoreExpandedElem.getText()).toMatch(/([A-z])/ig);
        expect(showMoreExpandedElem.isVisible()).toBe(true);
    });

    it('should expand on click', () => {
        const collapsedState = browser.getAttribute(showMoreExpanded, 'data-qa-show-more-expanded').includes('false');
        const ariaCollapsed = browser.getAttribute(showMoreExpanded, 'aria-expanded').includes('false');
        
        expect(collapsedState).toBe(true);
        expect(ariaCollapsed).toBe(true);

        browser.click(showMoreToggle);
        
        const afterClickState = browser.getAttribute(showMoreExpanded, 'data-qa-show-more-expanded').includes('true');
        const ariaAfterClick = browser.getAttribute(showMoreExpanded, 'aria-expanded').includes('true');

        expect(afterClickState).toBe(true);
        expect(ariaAfterClick).toBe(true);

    });

    it('should display example text', () => {
        const exampleText = $('[data-qa-show-more-expanded] + div p');
        expect(exampleText.getText()).toMatch(/([A-z])/ig);
    });

    it('should collapse on click', () => {
        browser.click(showMoreToggle);

        const afterCollapse = browser.getAttribute(showMoreExpanded, 'data-qa-show-more-expanded').includes('false');
        const ariaAfterCollapse = browser.getAttribute(showMoreExpanded, 'aria-expanded').includes('false');

        expect(afterCollapse).toBe(true);
        expect(ariaAfterCollapse).toBe(true);
    });
});
