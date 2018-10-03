const { constants } = require('../../../e2e/constants');
const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Expansion Panel Suite', () => {
    const component = 'ExpansionPanel';
    const childStories = [
        'Interactive',
        'Success!',
        'Warning!',
        'Error!',
        'Asynchronous Content',
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

    function panelDisplays() {
        browser.waitForVisible(panel, constants.wait.normal);

        const expansionPanel = $(panel);
        const expansionPanelText = $(panelSubheading);
        expect(expansionPanel.isVisible()).toBe(true);
        expect(expansionPanelText.getText()).toMatch(/([a-z])/ig);
    }

    describe('Interactive Suite', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[0]);
            panelDisplays();
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
            panelDisplays();
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
            navigateToStory(component, childStories[2]);
            panelDisplays();
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
            navigateToStory(component, childStories[3]);
            panelDisplays();
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

    describe('Asynchronous Content Suite', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[4]);
            panelDisplays();
        });

        it('should expand on click and display loading text', () => {
            const loadingMsg = 'Loading...';
            expandAssertGridItem();
            
            browser.waitUntil(function() {
                return browser.getText(gridItem).includes(loadingMsg);
            }, constants.wait.normal);
        });

        it('should display message after loaded', () => {
            const loadedMsg = 'Your patience has been rewarded';
            browser.waitUntil(function() {
                return browser.getText(gridItem).includes(loadedMsg);
            }, constants.wait.normal);
        });
    });
});
