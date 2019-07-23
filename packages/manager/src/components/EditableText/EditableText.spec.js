const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Editable Text Suite', () => {
    const component = 'Editable Text';
    const childStories = [
        'Headline %26 Title',
    ];

    const editableTextField = '[data-qa-editable-text]';
    const editableTextButton = '[data-qa-edit-button]';
    const editField = '[data-qa-edit-field]';
    const saveEdit = '[data-qa-save-edit]';
    const cancelEdit = '[data-qa-cancel-edit]';
    const newLabel = 'someNewValue!';

    let originalLabel;

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
        browser.waitForVisible(editableTextField);
    });

    it('should become an editable field on click', () => {
        originalLabel = $(editableTextField).getText();

        $(editableTextField).moveToObject();
        browser.waitForVisible(editableTextButton);

        $(editableTextButton).click();
        browser.waitForVisible(editField);
    });

    it('should edit the textfield', () => {
        $(editField).$('input').setValue(newLabel);
        browser.click(saveEdit);
        expect($(editableTextField).getText()).toBe(newLabel);
    });

    it('should not update the textfield on cancel', () => {
        $(editableTextField).moveToObject();
        browser.waitForVisible(editableTextButton);

        $(editableTextButton).click();
        $(cancelEdit).waitForVisible();

        $(editField).$('input').setValue(originalLabel);
        browser.click(cancelEdit);

        // Should contain the new label from the prior test
        expect($(editableTextField).getText()).toBe(newLabel);
    });
});
