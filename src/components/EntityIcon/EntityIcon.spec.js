const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Entity Icon Suite', () => {
    const component = 'Entity Icon';
    const childStory = 'Icons';

    const entityIcon = (entity,status,isLoading) => {
        return $(`[data-qa-icon="${entity}"][data-qa-entity-status="${status}"][data-qa-is-loading="${isLoading}"]`);
    }

    beforeAll(() => {
        navigateToStory(component, childStory);
    });

    it('Nodebalancer Icon displays with undefined status', () => {
        expect(entityIcon('nodebalancer','undefined','false').isVisible()).toBe(true);
        expect(entityIcon('nodebalancer','undefined','false').getCssProperty('color').parsed.hex).toBe('#e7e7e7');
    });

    it('Linode Icon displays with running status', () => {
        expect(entityIcon('linode','running','false').isVisible()).toBe(true);
        expect(entityIcon('linode','running','false').getCssProperty('color').parsed.hex).toBe('#00b159');
    });

    it('Linode Icon displays with offline status', () => {
        expect(entityIcon('linode','offline','false').isVisible()).toBe(true);
        expect(entityIcon('linode','offline','false').getCssProperty('color').parsed.hex).toBe('#ca0813');
    });

    it('Linode Icon displays with loading state', () => {
        expect(entityIcon('linode','offline','true').isVisible()).toBe(true);
    });
});
