const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Confirmation Dialog Suite', () => {
  const component = 'Confirmation Dialogs';
  const childStories = ['Simple Confirmation'];
  const doSomething = '[data-qa-dialog-button]';
  const confirmButton = '[data-qa-buttons] [data-qa-dialog-confirm]';
  const dialogTitle = '.dialog-title';
  const dismissButton = '[data-qa-buttons] [data-qa-dialog-cancel]';

  beforeEach(() => {
    navigateToStory(component, childStories[0]);
    $(doSomething).waitForDisplayed();
  });

  it('should display Do something!', () => {
    expect($(doSomething).getText())
      .withContext(`incorrect text`)
      .toBe('Do something!');
  });

  it('should display dialog on click', () => {
    $(doSomething).click();
    expect($(dialogTitle).getText())
      .withContext(`Incorrect dialog title`)
      .toBe('Are you sure you wanna?');
    expect($('[data-qa-dialog-content]').getText())
      .withContext(`Incorrect dialog text`)
      .toBe('stuff stuff stuff');
    expect($(confirmButton).isDisplayed())
      .withContext(`Confirm button should be displayed`)
      .toBe(true);
    expect($(dismissButton).isDisplayed())
      .withContext(`Dismiss button should be displayed`)
      .toBe(true);
    expect($(confirmButton).getTagName())
      .withContext(`Incorrect tag name`)
      .toBe('button');
    expect($(dismissButton).getTagName())
      .withContext(`Incorrect tag name`)
      .toBe('button');
    expect($(confirmButton).getText())
      .withContext(`Incorrect text`)
      .toBe(`Continue`);
    expect($(dismissButton).getText())
      .withContext(`Incorrect text`)
      .toBe(`Cancel`);
  });

  it('should close dialog with confirm button', () => {
    $(doSomething).click();
    $(confirmButton).click();
    $(dialogTitle).isDisplayed(1500, true);
  });

  it('should close dialog with cancel button', () => {
    $(doSomething).click();
    $(dialogTitle).waitForDisplayed();
    $(dismissButton).click();
    $(dialogTitle).waitForDisplayed(1500, true);
  });
});
