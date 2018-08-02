const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Notice Suite', () => {
    const component = 'Notice';
    const childStories = [
        'All Notices',
    ];

    let notices;

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display three notices', () => {
        notices = $$('[data-qa-notice]');
        expect(notices.length).toEqual(3);
    });

    it('should display an error notice', () => {
        const errorNotices = notices.filter(n => {
            const errorMsg = 'This is an error notice';
            return n.getAttribute('class').includes('error') && n.isVisible() && n.getText().includes(errorMsg);
        });
        expect(errorNotices.length).toEqual(1);
    });

    it('should display a warning notice', () => {
        const warningNotices = notices.filter(n => {
            const warningMsg = 'This is a warning notice';
            return n.getAttribute('class').includes('warning') && n.isVisible() && n.getText().includes(warningMsg);
        });
        expect(warningNotices.length).toEqual(1);
    });

    it('should display a success notice', () => {
        const successNotices = notices.filter(n => {
            const successMsg = 'This is a success notice';
            return n.getAttribute('class').includes('success') && n.isVisible() && n.getText().includes(successMsg);
        });
        expect(successNotices.length).toEqual(1);
    });
});
