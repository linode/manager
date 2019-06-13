const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Radio Suite', () => {
    const component = 'Radio';
    const childStories = [
        'Interactive',
    ]
    const radio = '[data-qa-radio]';
    let radios;

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display radio buttons', () => {
        browser.waitForVisible(radio);
        radios = $$(radio);

        radios.forEach(r => expect(r.isVisible()).toBe(true));
    });

    xit('should check enabled buttons on click', () => {
        const enabledRadios = $$(radio).filter(r => !r.getAttribute('class').includes('disabled'));
        enabledRadios.forEach(r => {
            r.click();
            expect(r.getAttribute('data-qa-radio').includes('true')).toBe(true);
        });
    });

    xit('should not check disabled buttons on click', () => {
        const disabledRadios = $$(radio).filter(r => r.getAttribute('class').includes('disabled'));
        disabledRadios.forEach(r => {
            r.$('..').click();
            expect(r.getAttribute('data-qa-radio').includes('false')).toBe(true);
        });
    });

    it('should have a label as a parent', () => {
        radios.forEach(r => {
            expect(r.$('..').getTagName()).toBe('label');
        });
    });
});
