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

        expect(dialogTitle.getText()).toBe('Are you sure you wanna?');
        expect($('[data-qa-dialog-content]').getText()).toBe('stuff stuff stuff');
        expect(confirmButton.isDisplayed()).toBe(true);
        expect(dismissButton.isDisplayed()).toBe(true);
        expect(confirmButton.getTagName()).toBe('button');
        expect(dismissButton.getTagName()).toBe('button');
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
