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
    $(tabbedPanel).waitForDisplayed();

    const tabbedPanelElem = $(tabbedPanel);
    expect(tabbedPanelElem.isDisplayed())
      .withContext(`Tabbed panel should be displayed`)
      .toBe(true);
  });

  it('should display tabs as buttons', () => {
    const tabs = $$(tab);
    tabs.forEach(t => expect(t.getAttribute('role'))
      .withContext(`Incorrect attribute for role ${t.index+1}`)
      .toBe('tab'));
    tabs.forEach(t => expect(t.getTagName())
      .withContext(`Incorrect TagName for button ${t.index+1}`)
      .toBe('button'));
  });

  it('should display panel heading', () => {
    const panelHeader = $(header);
    expect(panelHeader.isDisplayed())
      .withContext(`Panel header should be displayed`)
      .toBe(true);
    expect(panelHeader.getText())
      .withContext(`Missing header text`)
      .toMatch(/([A-Z])/ig);
  });

  it('should display panel copy', () => {
    const panelCopy = $(copy);
    expect(panelCopy.isDisplayed())
      .withContext(`Panel copy should be displayed`)
      .toBe(true);
    expect(panelCopy.getText())
      .withContext(`Incorrect panel copy text`)
      .toMatch(/([A-z])/ig);
  });

  it('should update panel text on tab change', () => {
    const tabs = $$(tab);
    let text;
    tabs.forEach(t => {
      t.click();
      $(tabBody).waitForDisplayed();
      const tabText = $(tabBody).getText();

      expect(tabText)
        .withContext(`Incorrect panel text: ${tabText} on Tab ${t.index+1}`)
        .not.toBe(text);
      text = tabText;
    });
  });

  it('should update tabs to selected on click', () => {
    const tabs = $$(tab);
    tabs.forEach(t => {
      t.click();
      const buttonColor = t.getCSSProperty('color');
      const selected = t.getAttribute('aria-selected').includes('true');

      expect(selected)
        .withContext(`Tab ${t.index+1} should be selected`)
        .toBe(true);
      expect(buttonColor.parsed.hex)
        .withContext(`Incorrect color for button ${t.index+1}`)
        .toBe('#32363c')
    });
  });
});
