const { waitForFocus, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Radio Suite', () => {
    const menuItem = '[data-name="Radio"]';
    const childStory = '[data-name="Interactive"]';
    const radio = '[data-qa-radio]';
    let radios;

    beforeAll(() => {
        // Untoggle Checkbox Story
        browser.click('[data-name="CheckBox"]');
    });

    it('should display radio component in navigation', () => {
        const radioStory = $(menuItem);
        expect(radioStory.isVisible()).toBe(true);
    });

    it('should display interactive child story', () => {
        browser.click(menuItem);
        expect($(childStory).waitForVisible()).toBe(true);
    });

    it('should display radio buttons', () => {
        browser.waitUntil(function() {
            try {
                browser.click(childStory);
                return true;
            } catch (err) {
                return false;
            }
        }, 5000);
        waitForFocus(radio);
        radios = $$(radio);

        radios.forEach(r => expect(r.isVisible()).toBe(true));
    });

    it('should check enabled buttons on click', () => {
        const enabledRadios = $$(radio).filter(r => !r.getAttribute('class').includes('disabled'));
        enabledRadios.forEach(r => {
            r.click();
            expect(r.getAttribute('data-qa-radio').includes('true')).toBe(true);
        });
    });

    it('should not check disabled buttons on click', () => {
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
