const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('SelectionRow Suite', () => {
    const component = 'SelectionRow';
    const childStories = [
        'Example',
    ];
    const tableRowSelector = '[data-qa-table-row]';

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display each columns with expected data', () => {
        $$(tableRowSelector).forEach(row => {
            expect(row.$('[data-qa-stackscript-title]').getText()).toMatch(/./g);
            expect(row.$('[data-qa-stackscript-deploys]').getText()).toMatch(/\d/g);
            expect(row.$('[data-qa-stackscript-revision]').getText()).toMatch(/\d\d\d\d\/\d\d\/\d\d/g);
        });
    });

    it('should display 3 rows with radios with only one selectable at a time', () => {
        // Get rows with radio buttons
        const radioRows = $$(tableRowSelector).filter(row => row.$('[data-qa-radio]').isVisible());

        radioRows.forEach(row => {
            row.click();
            expect(row.$('[data-qa-radio]').getAttribute('data-qa-radio')).toBe('true');
        });
    });

    it('should display compatible image chip labels', () => {
        $$(tableRowSelector).forEach(row => {
            expect(row.$('[data-qa-stackscript-images]').isVisible()).toBe(true);
            browser.waitForVisible('[data-qa-tag]');
            expect(row.$$('[data-qa-tag="true"]').length).toBeGreaterThan(0);
        });
    });

    it('should display deploy a linode action button', () => {
        const deployButton = '[data-qa-stackscript-deploy]'
        const deployButtonRows = $$(tableRowSelector).filter(row => row.$(deployButton).isVisible());

        deployButtonRows.forEach(row => {
            expect(row.$('[data-qa-stackscript-deploy] > button').getAttribute('type')).toBe('button');
            expect(row.$('[data-qa-stackscript-deploy] > a').getAttribute('href')).toContain('href="/linodes/create?type=fromStackScript&stackScriptID=');
        });
    });
});
