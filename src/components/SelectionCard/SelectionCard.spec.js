const { constants } = require('../../../e2e/constants');
const { waitForFocus } = require('../../../e2e/utils/storybook');

describe('Selection Card Suite', () => {
    const menuItem = '[data-name="SelectionCard"]';

    const childStories = {
        "Interactive example" : '[data-name="Interactive example"]',
        "Default with SvgIcon" : '[data-name="Default with SvgIcon"]',
    }

    const selectionCard = '[data-qa-selection-card]';
    const heading = '[data-qa-select-card-heading]';
    const subheading = '[data-qa-select-card-subheading]';

    beforeAll(() => {
        browser.url(constants.routes.storybook);
    });

    it('should display selection card in navigation', () => {
        const selectionCardStory = $(menuItem);
        expect(selectionCardStory.isVisible()).toBe(true);
    });

    it('should display selection card child stories', () => {
        browser.click(menuItem);
        const stories = Object.values(childStories);

        browser.waitForVisible(stories[0]);
        stories.forEach(e => {
            expect(browser.isVisible(e)).toBe(true);
        });
    });

    describe('Interactive Example Suite', () => {
        beforeAll(() => {
            browser.click(childStories["Interactive example"]);
        });

        it('should display three selection card with one disabled', () => {
            waitForFocus(selectionCard);

            browser.click(selectionCard);

            const selectionCardElements = $$(selectionCard);
            const disabledCards = selectionCardElements.filter(e => e.getAttribute('class').includes('disabled'));

            expect(disabledCards.length).toBe(1);
            expect(selectionCardElements.length).toBe(3);
        });

        it('should select check enabled cards', () => {
            const enabledCards = $$(selectionCard).filter(e => !e.getAttribute('class').includes('disabled'));
            enabledCards.forEach(card => {
                card.click();
                const checked = card.getAttribute('data-qa-selection-card');
                expect(checked).toBe('true');
            }); 
        });

        it('should display all headings on all selection cards', () => {
            const headingElems = $$(heading);
            const subheadingElems = $$(subheading);

            headingElems.forEach(e => expect(e.isVisible()).toBe(true));
            subheadingElems.forEach(e => expect(e.isVisible()).toBe(true));
        });

        it('should display svg icons for all selection cards', () => {
            const svgElems = $$(`${selectionCard} svg`);
            svgElems.forEach(svg => expect(svg.isVisible()).toBe(true));
        });
    });
});