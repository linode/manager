const { navigateToStory } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Tile Suite', () => {
    beforeAll(() => {
        const story = 'Tile';
        const childStories = ['internal'];

        navigateToStory(story, childStories[0]);
    });

    it('should display the tile', () => {
        const title = 'This is the Tile title';
        const description = /In order to make the tile a link, the link prop needs to be set. It can be either an internal or external link, or an onClick function/ig;

        browser.waitForVisible('[data-qa-tile]', constants.wait.normal);

        expect($('[data-qa-tile-icon]').isVisible()).toBe(true);
        expect($('[data-qa-tile-title]').getText()).toBe(title);
        expect($('[data-qa-tile-desc]').getText()).toMatch(description)
    });

    it('should link to another page', () => {
        const link = 'http://cloud.manager.com/';
        const tileLink = $('[data-qa-tile-title]').$('a').getAttribute('href');
        
        expect(tileLink).toBe(link);
    });
});
