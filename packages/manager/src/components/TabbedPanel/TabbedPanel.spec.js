const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Tabbed Panel Suite', () => {
    const component = 'TabbedPanel';
    const childStories = [
        'default',
    ]
    const tabbedPanel = '[data-qa-tp]';
    const header = '[data-qa-tp-title]';
    const copy = '[data-qa-tp-copy]';
    const tab = '[data-qa-tab]';
    const tabBody = '[data-qa-tab-body]';

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display tabbed panel', () => {
      browser.waitForVisible(tabbedPanel);

      const tabbedPanelElem = $(tabbedPanel);
      expect(tabbedPanelElem.isVisible()).toBe(true);
    });

    it('should display tabs as buttons', () => {
        const tabs = $$(tab);
        tabs.forEach(t => expect(t.getAttribute('role')).toBe('tab'));
        tabs.forEach(t => expect(t.getTagName()).toBe('button'));
    });

    it('should display panel heading', () => {
        const panelHeader = $(header);
        expect(panelHeader.isVisible()).toBe(true);
        expect(panelHeader.getText()).toMatch(/([A-Z])/ig);
    });

    it('should display panel copy', () => {
        const panelCopy = $(copy);
        expect(panelCopy.isVisible()).toBe(true);
        expect(panelCopy.getText()).toMatch(/([A-z])/ig);
    });

    it('should update panel text on tab change', () => {
        const tabs = $$(tab);
        let text;
        tabs.forEach(t => {
            t.click();
            browser.waitForText(tabBody);
            const tabText = browser.getText(tabBody);
            expect(tabText).not.toBe(text);
            text = tabText;
        });
    });

    it('should update tabs to selected on click', () => {
        const tabs = $$(tab);
        tabs.forEach(t => {
            t.click();
            const buttonColor = t.getCssProperty('color');
            const selected = t.getAttribute('aria-selected').includes('true');

            expect(selected).toBe(true);
            expect(buttonColor.parsed.hex).toBe('#32363c')
        });
    });
});
