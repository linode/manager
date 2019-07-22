const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Entity Icon -', () => {
    const component = 'Entity Icon';
    const childStory = 'Icons';
    const iconStatusMsg = 'Icon status should be displayed';
    const iconColorMsg = 'Icon hex color is incorrect';
    const ariaError = 'incorrect aria label';

    const entityIcon = (entity,status,isLoading) => {
        return $(`[data-qa-icon="${entity}"][data-qa-entity-status="${status}"][data-qa-is-loading="${isLoading}"]`);
    }

    beforeAll(() => {
        navigateToStory(component, childStory);
    });

    it('Nodebalancer Icon displays with undefined status', () => {
        expect(entityIcon('nodebalancer','undefined','false').isDisplayed())
          .withContext(`${iconStatusMsg}`).toBe(true);
        expect(entityIcon('nodebalancer','undefined','false').getCSSProperty('color').parsed.hex)
          .withContext(`${iconColorMsg}`).toBe('#e7e7e7');
        expect(entityIcon('nodebalancer','undefined','false').getAttribute('aria-label'))
          .withContext(`${ariaError}`).toBe(`nodebalancer is undefined`)
    });

    it('Linode Icon displays with running status', () => {
        expect(entityIcon('linode','running','false').isDisplayed())
          .withContext(`${iconStatusMsg} running`).toBe(true);
        expect(entityIcon('linode','running','false').getCSSProperty('color').parsed.hex)
          .withContext(`${iconColorMsg}`).toBe('#00b159');
        expect(entityIcon('linode','running','false').getAttribute('aria-label'))
          .withContext(`${ariaError}`).toBe('linode is running')
    });

    it('Linode Icon displays with offline status', () => {
        expect(entityIcon('linode','offline','false').isDisplayed())
          .withContext(`${iconStatusMsg}`).toBe(true);
        expect(entityIcon('linode','offline','false').getCSSProperty('color').parsed.hex)
          .withContext(`${iconColorMsg}`).toBe('#ca0813');
        expect(entityIcon('linode','offline','false').getAttribute('aria-label'))
          .withContext(`${ariaError}`).toBe(`linode is offline`)
    });

    it('Linode Icon displays with loading state', () => {
        expect(entityIcon('linode','loading','true').isDisplayed())
          .withContext(`${iconStatusMsg}`).toBe(true);
        expect(entityIcon('linode','loading','true').getCSSProperty('color').parsed.hex)
          .withContext(`${iconColorMsg}`).toBe('#000000');
        expect(entityIcon('linode','loading','true').getAttribute('aria-label'))
          .withContext(`${ariaError}`).toBe(`linode is loading`)
    });

    it('Domain Icon displays active status', () => {
        expect(entityIcon('domain','active','false').isDisplayed())
          .withContext(`Domain icon should be displayed`);
        expect(entityIcon('domain','active','false').getCSSProperty('color').parsed.hex)
          .withContext(`Domain icon hex color is incorrect`).toBe('#00b159');
        expect(entityIcon('domain','active','false').getAttribute('aria-label'))
          .withContext(`${ariaError}`).toBe(`domain is running`)
    });

    it('Domain Icon displays disabled status', () => {
        expect(entityIcon('domain','disabled','false').isDisplayed())
          .withContext(`Domain icon should be displayed`);
        expect(entityIcon('domain','disabled','false').getCSSProperty('color').parsed.hex)
          .withContext(`Domain icon hex color is incorrect`).toBe('#ca0813');
        expect(entityIcon('domain','disabled','false').getAttribute('aria-label'))
          .withContext(`${ariaError}`).toBe(`domain is offline`)
    });
});
