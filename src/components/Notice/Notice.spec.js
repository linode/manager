const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Notice Suite', () => {
    const component = 'Notice';
    const childStories = [
        'All Notices',
    ];

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display error, warning, and success notices', () => {
        const notices = $$('[data-qa-notice]');

        const errorNotices =
            notices.filter(n => n.getAttribute('class').includes('error') && n.isVisible());

        const warningNotices =
            notices.filter(n => n.getAttribute('class').includes('warning') && n.isVisible());

        const successNotices =
            notices.filter(n => n.getAttribute('class').includes('success') && n.isVisible());

        expect(notices.length).toEqual(3);
        expect(errorNotices.length).toEqual(1);
        expect(warningNotices.length).toEqual(1);
        expect(successNotices.length).toEqual(1);
    });
});
