const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Confirmation Dialog Suite', () => {
    const component = 'Confirmation Dialogs';
    const childStories = [
        'Simple Confirmation',
    ];
    const confirmButtonTextElem = '[data-qa-dialog-button]';
    const dialogTitleElem = '[data-qa-dialog-title="true"]';
    const confirmButtonElem = '[data-qa-dialog-confirm]';

    let dismissButtonElem = '[data-qa-dialog-cancel]';
    let confirmButton, dismissButton, dialogTitle;

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display confirm button text', () => {
        $(confirmButtonTextElem).waitForDisplayed();
    });

    it('should display dialog on click', () => {
        $(confirmButtonTextElem).click();
        dialogTitle = $(dialogTitleElem);
        confirmButton = $(confirmButtonElem);
        dismissButton = $(dismissButtonElem);

        expect(dialogTitle.getText())
          .withContext(`Incorrect dialog title`).toBe('Are you sure you wanna?');
        expect($('[data-qa-dialog-content]').getText())
          .withContext(`Incorrect dialog text`).toBe('stuff stuff stuff');
        expect(confirmButton.isDisplayed())
          .withContext(`Confirm button should be displayed`).toBe(true);
        expect(dismissButton.isDisplayed())
          .withContext(`Dismiss button should be displayed`).toBe(true);
        expect(confirmButton.getTagName())
          .withContext(`Incorrect tag name`).toBe('button');
        expect(dismissButton.getTagName())
          .withContext(`Incorrect tag name`).toBe('button');
    });

    it('should close dialog on yes', () => {
        confirmButton.click();
        dialogTitle.isDisplayed(1500, true);
    });

    it('should close dialog on no', () => {
        $(confirmButtonTextElem).click();
        $(dialogTitleElem).waitForDisplayed();
        dismissButton.click();
        dialogTitle.waitForDisplayed(1500, true);
    });
});
