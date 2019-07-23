const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Confirmation Dialog Suite', () => {
    const component = 'Confirmation Dialogs';
    const childStories = [
        'Simple Confirmation',
    ];
    const confirmButtonTextElem = '[data-qa-dialog-button]';
    const dialogTitleElem = '[data-qa-dialog-title]';
    const confirmButtonElem = '[data-qa-dialog-confirm]';

    let dismissButtonElem = '[data-qa-dialog-cancel]';
    let confirmButton, dismissButton, dialogTitle;

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
    });

    it('should display confirm button text', () => {
        browser.waitForVisible(confirmButtonTextElem);
    });

    it('should display dialog on click', () => {
        browser.click(confirmButtonTextElem);
        dialogTitle = $(dialogTitleElem);
        confirmButton = $(confirmButtonElem);
        dismissButton = $(dismissButtonElem);

        expect(dialogTitle.getText()).toBe('Are you sure you wanna?');
        expect($('[data-qa-dialog-content]').getText()).toBe('stuff stuff stuff');
        expect(confirmButton.isVisible()).toBe(true);
        expect(dismissButton.isVisible()).toBe(true);
        expect(confirmButton.getTagName()).toBe('button');
        expect(dismissButton.getTagName()).toBe('button');
    });

    it('should close dialog on yes', () => {
        confirmButton.click();
        dialogTitle.waitForVisible(1500, true);
    });

    it('should close dialog on no', () => {
        browser.click(confirmButtonTextElem);
        browser.waitForVisible(dialogTitleElem);
        dismissButton.click();
        dialogTitle.waitForVisible(1500, true);
    });
});
