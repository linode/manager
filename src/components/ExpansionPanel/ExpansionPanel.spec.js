const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Expansion Panel Suite', () => {
    const component = 'ExpansionPanel';
    const childStories = [
        'Interactive',
        'Success!',
        'Warning!',
        'Error!',
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

    it('should display expansion panels', () => {
        executeInAllStories(component, childStories, () => {
            browser.waitForVisible(panel);

            const expansionPanel = $(panel);
            const expansionPanelText = $(panelSubheading);
            expect(expansionPanel.isVisible()).toBe(true);
            expect(expansionPanelText.getText()).toMatch(/([a-z])/ig);
        });
    });

    describe('Interactive Suite', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[0]);
            browser.waitForVisible(panel);
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
            navigateToStory(component, childStories[1]);
            browser.waitForVisible(panel);
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
            navigateToStory(component, childStories[1]);
            browser.waitForVisible(panel);
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
            navigateToStory(component, childStories[2]);
            browser.waitForVisible(panel);
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
