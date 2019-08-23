const { constants } = require('../../../e2e/constants');
const { navigateToStory } = require('../../../e2e/utils/storybook');

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
  const saveButton = '[data-qa-save]';
  const cancelButton = '[data-qa-cancel]';
  let childElements;

  function assertNotice(noticeTxt) {
    const noticeMsg = $(notice);
    noticeMsg.waitForExist();
    expect(noticeMsg.isDisplayed())
      .withContext(`notice message was not displayed`).toBe(true);
    expect(noticeMsg.getText())
      .withContext(`Incorrect text found`).toMatch(noticeTxt);
  }

  function expandAssertGridItem(visible=true,opposite=false) {
    $('[data-qa-panel-summary]').click();
    $(gridItem).waitForDisplayed(constants.wait.short, opposite)
    expect($(gridItem).isDisplayed())
      .withContext(`grid item display should be ${visible}`)
      .toBe(visible);
  };

  function panelDisplays(panelMsg) {
    $(panel).waitForDisplayed(constants.wait.normal);
    expect($(panelSubheading).getText())
      .withContext(`Incorrect text found`).toEqual(panelMsg);
    expect($(panel).isDisplayed())
      .withContext(`Expansion panel should be displayed`).toBe(true)
  }

  function checkButtons() {
    expect($$('button').length)
      .withContext(`should be two buttons`)
      .toBe(2);
    const saveBtn = $(saveButton);
    const cancelBtn = $(cancelButton);
    browser.pause(100);

    expect(cancelBtn.isDisplayed())
      .withContext(`cancel button should be displayed`)
      .toBe(true);
    expect(cancelBtn.getText())
      .withContext(`incorrect cancel button text`)
      .toBe('Cancel');
    expect(saveBtn.isDisplayed())
      .withContext(`should be displayed`)
      .toBe(true);
    expect(saveBtn.getText())
      .withContext(`incorrect save button text`)
      .toBe('Save');

  }

  describe('Interactive Suite', () => {
    beforeEach(() => {
      navigateToStory(component, childStories[0]);
      panelDisplays('The best Linode department is?');
    });

    it('should expand and display message text', () => {
      expandAssertGridItem();
    });

    it('should collapse on click', () => {
      expandAssertGridItem();
      expandAssertGridItem(false,true);
    });
  });

  describe('Success Suite', () => {
    beforeEach(() => {
      navigateToStory(component, childStories[1]);
      panelDisplays(`Why is Linode the best?`);
    });

    it('should expand on click and display message text', () => {
      expandAssertGridItem();
    });

    it('should display success notice message', () => {
      expandAssertGridItem();
      assertNotice('You did it!');
    });

    it('should display save and cancel buttons', () => {
      expandAssertGridItem();
      checkButtons();
    });

    it('should collapse on click', () => {
      expandAssertGridItem();
      expandAssertGridItem(false, true);
    });
  });

  describe('Warning Suite', () => {
    beforeEach(() => {
      navigateToStory(component, childStories[2]);
      panelDisplays('This is a warning');
    });

    it('should expand on click and display message text', () => {
      expandAssertGridItem();
    });

    it('should display warning notice message', () => {
      expandAssertGridItem();
      assertNotice('Careful now...');
    });

    it('should display save and cancel buttons', () => {
      expandAssertGridItem();
      checkButtons();
    });

    it('should collapse on click', () => {
      expandAssertGridItem();
      expandAssertGridItem(false, true);
    });
  });

  describe('Error Suite', () => {
    beforeEach(() => {
      navigateToStory(component, childStories[3]);
      panelDisplays('Creating a new linode');
    });

    it('should expand on click and display message text', () => {
      expandAssertGridItem();
    });

    it('should display error notice message', () => {
      expandAssertGridItem();
      assertNotice('Oh no! Something broke!');
    });

    it('should display save and cancel buttons', () => {
      expandAssertGridItem();
      checkButtons();
    });

    it('should collapse on click', () => {
      expandAssertGridItem();
      expandAssertGridItem(false, true);
    });
  });

  describe('Asynchronous Content Suite', () => {
    beforeEach(() => {
      navigateToStory(component, childStories[4]);
      panelDisplays('Open to Reveal Asynchronously Loaded Content');
    });

    it('should expand on click and display loading text', () => {
      const loadingMsg = 'Loading...';
      expandAssertGridItem();
      browser.waitUntil(function() {
          return $(gridItem).getText().includes(loadingMsg);
      }, constants.wait.normal);
    });

    it('should display message after loaded', () => {
      expandAssertGridItem();
      const loadedMsg = 'Your patience has been rewarded';
      browser.waitUntil(function() {
          return $(gridItem).getText().includes(loadedMsg);
      }, constants.wait.normal);
    });
  });
});
