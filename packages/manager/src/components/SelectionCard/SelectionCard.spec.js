const { navigateToStory , executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Selection Card Suite', () => {
    const component = 'SelectionCard';
    const childStories = [
        'Interactive example',
        'Default with SvgIcon',
        'Default with plain SVG',
        'Default with font Icon',
        'Default with no Icon',
        'Checked with SvgIcon',
        'Checked with plain SVG',
        'Checked with font Icon',
        'Checked with no Icon',
    ]

    const selectionCard = '[data-qa-selection-card]';
    const heading = '[data-qa-select-card-heading]';
    const subheading = '[data-qa-select-card-subheading]';

    const assertCardsChecked = () => {
        const selectionCardElems = $$(selectionCard);
        selectionCardElems.forEach(e => {
            expect(e.getAttribute('class').includes('checked')).toBe(true);
            expect(e.$('[data-qa-checked]').getAttribute('data-qa-checked')).toBe('true');
        });
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

    it('should display selection cards', () => {
        executeInAllStories(component, childStories, () => {
            browser.jsClick(selectionCard);

            const selectionCardElems = $$(selectionCard);

            selectionCardElems.forEach(card => expect(card.isVisible()).toBe(true));
            expect(selectionCardElems.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('should display headings on all selection cards', () => {
        executeInAllStories(component, childStories, () => {
            const headingElems = $$(heading);
            headingElems.forEach(e => expect(e.isVisible()).toBe(true));
        });
    });

    describe('Interactive Example Suite', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[0]);
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
                expect(card.$('[data-qa-checked]').getAttribute('data-qa-checked')).toBe('true');
            }); 
        });

        it('should display subheadings for all selection cards', () => {
            const subheadingElems = $$(subheading);
            subheadingElems.forEach(e => expect(e.isVisible()).toBe(true));
        });
    });

    describe('Default with SVGicon Suite', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[1]);
        });

        it('should display svg icons for all selection cards', () => {
            assertSvgIconsDisplay();
        });
    });

    describe('Default with plain SVG', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[2]);
        });

        it('should display plain svgs for all selection cards', () => {

        });
    });

    describe('Default with font Icon', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[3]);
        });

        it('should display a font icon on each selection card', () => {
            assertFontIconsDisplay();
        });
    });

    describe('Default with no icon', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[4]);
        });

        it('should not display svgs or font icons', () => {
            assertNoIcons();
        });
    });

    describe('Checked with SvgIcon Suite', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[5]);
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
            navigateToStory(component, childStories[6]);
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
            navigateToStory(component, childStories[7]);
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
            navigateToStory(component, childStories[8]);
        });

        it('should be checked', () => {
           assertCardsChecked(); 
        });

        it('should not display any icon type', () => {
            assertNoIcons(true);
        });
    });
});
