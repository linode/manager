const { constants } = require('../../../e2e/constants');
const { waitForFocus, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Selection Card Suite', () => {
    const menuItem = '[data-name="SelectionCard"]';
    const childStories = {
        "Interactive example" : '[data-name="Interactive example"]',
        "Default with SvgIcon" : '[data-name="Default with SvgIcon"]',
        "Default with plain SVG" : '[data-name="Default with plain SVG"]',
        "Default with font Icon" : '[data-name="Default with font Icon"]',
        "Default with no Icon" : '[data-name="Default with no Icon"]',
        "Checked with SvgIcon" : '[data-name="Checked with SvgIcon"]',
        "Checked with plain SVG" : '[data-name="Checked with plain SVG"]',
        "Checked with font icon" : '[data-name="Checked with font Icon"]',
        "Checked with no Icon" : '[data-name="Checked with no Icon"]',
    }

    const selectionCard = '[data-qa-selection-card]';
    const heading = '[data-qa-select-card-heading]';
    const subheading = '[data-qa-select-card-subheading]';
    const childStoryArray = Object.values(childStories);

    const assertCardsChecked = () => {
        const selectionCardElems = $$(selectionCard);
        selectionCardElems.forEach(e => expect(e.getAttribute('class').includes('checked')).toBe(true)  );
    }

    const assertPlainSvgsDisplay = () => {
        const plainSvgs = $$(`${selectionCard} svg g`);
        plainSvgs.forEach(svg => expect(svg.isVisible()).toBe(true));
    }

    const assertSvgIconsDisplay = () => {
        const svgElems = $$(`${selectionCard} svg`);
        svgElems.forEach(svg => expect(svg.isVisible()).toBe(true));
    }

    const assertFontIconsDisplay = () => {
        const selectionCardElems = $$(selectionCard);
        const fontIcons = $$(`${selectionCard} span`).filter(e => e.getAttribute('class').includes('fl-'));
        
        fontIcons.forEach(icon => expect(icon.isVisible()).toBe(true));
        expect(fontIcons.length).toEqual(selectionCardElems.length);
    }

    const assertNoIcons = (checked) => {
        const fontIcons = $$(`${selectionCard} span`).filter(e => e.getAttribute('class').includes('fl-'));
        
        if (checked) {
            const svgs = $$(`${selectionCard} svg`);
            expect(svgs.length).toBe(3);
        } else {
            const svgs = browser.isExisting(`${selectionCard} svg`);
            expect(svgs).toBe(false);
        }
        fontIcons.forEach(icon => expect(icon).toBe(false));
    }

    const navigateToStory = (story) => {
        browser.frame();
        browser.click(story);
        waitForFocus(selectionCard);
    }

    it('should display selection card in navigation', () => {
        const selectionCardElemstory = $(menuItem);
        expect(selectionCardElemstory.isVisible()).toBe(true);
    });

    it('should display selection card child stories', () => {
        browser.click(menuItem);

        browser.waitForVisible(childStoryArray[0]);
        childStoryArray.forEach(story => {
            expect(browser.isVisible(story)).toBe(true);
        });
    });

    it('should display selection cards', () => {
        executeInAllStories(childStoryArray, () => {
            browser.jsClick(selectionCard);

            const selectionCardElems = $$(selectionCard);

            selectionCardElems.forEach(card => expect(card.isVisible()).toBe(true));
            expect(selectionCardElems.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('should display headings on all selection cards', () => {
        executeInAllStories(childStoryArray, () => {
            const headingElems = $$(heading);
            headingElems.forEach(e => expect(e.isVisible()).toBe(true));
        });
    });

    describe('Interactive Example Suite', () => {
        beforeAll(() => {
            navigateToStory(childStories["Interactive example"]);
        });

        it('should display three selection card with one disabled', () => {
            browser.click(selectionCard);

            const selectionCardElements = $$(selectionCard);
            const disabledCards = selectionCardElements.filter(e => e.getAttribute('class').includes('disabled'));

            expect(disabledCards.length).toBe(1);
            expect(selectionCardElements.length).toBe(3);
        });

        it('should check enabled cards', () => {
            const enabledCards = $$(selectionCard).filter(e => !e.getAttribute('class').includes('disabled'));
            enabledCards.forEach(card => {
                card.click();
                const classes = card.getAttribute('class');
                expect(classes.includes('checked')).toBe(true);
            }); 
        });

        it('should display subheadings for all selection cards', () => {
            const subheadingElems = $$(subheading);
            subheadingElems.forEach(e => expect(e.isVisible()).toBe(true));
 
        });
    });

    describe('Default with SVGicon Suite', () => {
        beforeAll(() => {
            navigateToStory(childStories["Default with SvgIcon"]);
        });

        it('should display svg icons for all selection cards', () => {
            assertSvgIconsDisplay();
        });
    });

    describe('Default with plain SVG', () => {
        beforeAll(() => {
            navigateToStory(childStories["Default with plain SVG"]);
        });

        it('should display plain svgs for all selection cards', () => {

        });
    });

    describe('Default with font Icon', () => {
        beforeAll(() => {
            navigateToStory(childStories["Default with font Icon"]);
        });

        it('should display a font icon on each selection card', () => {
            assertFontIconsDisplay();
        });
    });

    describe('Default with no icon', () => {
        beforeAll(() => {
            navigateToStory(childStories["Default with no Icon"]);
        });

        it('should not display svgs or font icons', () => {
            assertNoIcons();
        });
    });

    describe('Checked with SvgIcon Suite', () => {
        beforeAll(() => {
            navigateToStory(childStories["Checked with SvgIcon"]);
        });

        it('should display all selection cards as checked', () => {
            assertCardsChecked();
        });

        it('should display svg icons for all selection cards', () => {
            const selectionCardElems = $$(`${selectionCard} svg`);
            selectionCardElems.forEach(e => expect(e.isVisible()).toBe(true));
        });
    });

    describe('Checked with plain SVG', () => {
        beforeAll(() => {
            navigateToStory(childStories["Checked with plain SVG"]);
        });

        it('should display plain svg', () => {
            assertPlainSvgsDisplay();
        });

        it('should be checked', () => {
            assertCardsChecked();
        });
    });

    describe('Checked with font icon', () => {
        beforeAll(() => {
            navigateToStory(childStories["Checked with font icon"]);
        });

        it('should display font icon', () => {
            assertFontIconsDisplay();
        });

        it('should be checked', () => {
            assertCardsChecked();
        });
    });

    describe('Checked with no Icon', () => {
        beforeAll(() => {
            navigateToStory(childStories["Checked with no Icon"]);
        });

        it('should be checked', () => {
           assertCardsChecked(); 
        });

        it('should not display any icon type', () => {
            assertNoIcons(true);
        });
    });
});
