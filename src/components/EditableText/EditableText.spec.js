const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Editable Text Suite', () => {
    const component = 'Editable Text';
    const childStories = [
        'Headline %26 Title',
    ];

    const editableTextSelector = '[data-qa-editable-text]';
    const editField = '[data-qa-edit-field]';
    const editButtonSelector = '[data-qa-edit-button]';
    const saveEdit = '[data-qa-save-edit]';
    const cancelEdit = '[data-qa-cancel-edit]';
    const newLabel = 'someNewValue!';

    let originalLabel;

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
        browser.waitForVisible(editableTextSelector);
    });

    it('should become an editable field on click', () => {
        originalLabel = $(editableTextSelector).getText();

        $(editButtonSelector).click();
        browser.waitForVisible(editField);
    });

    it('should edit the textfield', () => {
        $(editField).$('input').setValue(newLabel);
        browser.click(saveEdit);
        expect($(editableTextSelector).getText()).toBe(newLabel);
    });

    it('should not update the textfield on cancel', () => {
        $(editableTextSelector).click();
        $(cancelEdit).waitForVisible();
        $(editField).$('input').setValue(originalLabel);
        browser.click(cancelEdit);

        // Should contain the new label from the prior test
        expect($(editableTextSelector).getText()).toBe(newLabel);
    });
});
