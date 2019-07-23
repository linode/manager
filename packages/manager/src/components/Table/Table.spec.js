const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Table Suite', () => {

    beforeAll(() => {
        const component = 'Table';
        const childStories = ['default'];
        navigateToStory(component, childStories[0]);
    });

    it('should display table elements', () => {
        browser.waitForVisible('[data-qa-table]');
        expect($$('[data-qa-column-heading]').length).toBe(3);
        expect($$('[data-qa-table-row]').length).toBe(3);
        expect($$('[data-qa-table-cell]').length).toBe(9);
    });

    it('should display the column titles', () => {
        const headings = $$('[data-qa-column-heading]').map(h => h.getText());
        const expectedHeadings = ['Head-1-1', 'Head-1-2', 'Head-1-3'];
        expect(headings).toEqual(expectedHeadings);
    });
});
