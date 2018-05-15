const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Tags Suite', () => {
    const component = 'Tags';
    const childStories = [
        'primary',
        'white',
        'gray',
        'editable',
    ];
    const tag = '[data-qa-tag]';

    it('should display tag in each story', () => {
        executeInAllStories(component, childStories, () => {
            const tagElem = $(tag);
            expect(tagElem.isVisible()).toBe(true);
        });
    });

    describe('Editable Tag Suite', () => {
        beforeAll(() => {
           navigateToStory(component, childStories[3]);
           browser.waitForVisible(tag);
        });

        it('should display a delete icon child element', () => {
            const svgIcon = $(`${tag} svg`);
            expect(svgIcon.isVisible()).toBe(true);
        });
    });
});
