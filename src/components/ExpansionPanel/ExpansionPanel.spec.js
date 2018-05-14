const { waitForFocus, previewFocus } = require('../../../e2e/utils/storybook');

describe('Expansion Panel Suite', () => {
    const navItem = '[data-name="ExpansionPanel"]';
    const childStories = [
        '[data-name="Interactive"]',
        '[data-name="Success!"]',
        '[data-name="Warning!"]',
        '[data-name="Error!"]',
    ];

    const panel = '[data-qa-panel]';
    const panelSubheading = '[data-qa-panel-subheading]';
    const gridItem = '[data-qa-grid-item]';
    const notice = '[data-qa-notice]';
    let childElements;

    function assertNotice() {
        const noticeMsg = $(notice);
        expect(noticeMsg.isVisible()).toBe(true);
        expect(noticeMsg.getText()).toMatch(/([a-z])/ig);
    }

    function expandAssertGridItem(opposite=false) {
        browser.click('[data-qa-panel-summary]');
        browser.waitForVisible(gridItem, 5000, opposite)
    }

    it('should display expansion panel story in navigation', () => {
        const nav = $(navItem);
        expect(nav.isVisible()).toBe(true);
    });

    it('should display child stories', () => {
        $(navItem).click();
        childElements = childStories.map((c) => $(c));
        childElements.forEach(c => c.click());
    });

    it('should display expansion panels', () => {
        childElements.forEach(c => {
            c.click();
            waitForFocus(panel);

            const expansionPanel = $(panel);
            const expansionPanelText = $(panelSubheading);
            expect(expansionPanel.isVisible()).toBe(true);
            expect(expansionPanelText.getText()).toMatch(/([a-z])/ig);
            browser.frame();
        });
    });

    describe('Interactive Suite', () => {
        beforeAll(() => {
            browser.frame();
            childElements[0].click();
            previewFocus();
        });

        it('should expand and display message text', () => {
            expandAssertGridItem();
        });

        it('should collapse on click', () => {
            expandAssertGridItem(true);
        });
    });

    describe('Success Suite', () => {
        beforeAll(() => {
            browser.frame();
            childElements[1].click();
            previewFocus();
        });

        it('should expand on click and display message text', () => {
            expandAssertGridItem();
        });

        it('should display success notice message', () => {
           assertNotice(); 
        });

        it('should display save and cancel buttons', () => {
            const buttons = $$('button');
            const visibleButtons = buttons.filter(b => b.isVisible() && !!b.getText());
            expect(visibleButtons.length).toBe(2);
        });

        it('shoulds collapse on click', () => {
            expandAssertGridItem(true);
        });
    });

    describe('Warning Suite', () => {
        beforeAll(() => {
            browser.frame();
            childElements[2].click();
            previewFocus();
        });

        it('should expand on click and display message text', () => {
            expandAssertGridItem();
        });

        it('should display warning notice message', () => {
            assertNotice();
        });

        it('should display save and cancel buttons', () => {
            const buttons = $$('button');
            const visibleButtons = buttons.filter(b => b.isVisible() && !!b.getText());
            expect(visibleButtons.length).toBe(2);
        });

        it('should collapse on click', () => {
            expandAssertGridItem(true);
        });
    });

    describe('Error Suite', () => {
        beforeAll(() => {
            browser.frame();
            childElements[3].click();
            previewFocus();
        });

        it('should expand on click and display message text', () => {
            expandAssertGridItem();
        });

        it('should display error notice message', () => {
            assertNotice();
        });

        it('should display save and cancel buttons', () => {
            const buttons = $$('button');
            const visibleButtons = buttons.filter(b => b.isVisible() && !!b.getText());
            expect(visibleButtons.length).toBe(2);
        });

        it('should collapse on click', () => {
            expandAssertGridItem(true);
        });
    });
});
