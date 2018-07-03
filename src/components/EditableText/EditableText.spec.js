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

    let originalValue, editableText;

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
        browser.waitForVisible(editableText);
    });

    it('should become an editable field on click', () => {
        editableText = $$(editableTextSelector);
        originalValue = editableText[0].getText();

        $$(editButtonSelector)[0].click();
        browser.waitForVisible(editField);
    });

    it('should edit the textfield', () => {
        $(editField).$('input').setValue(newLabel);
        browser.click(saveEdit);
        expect($$(editableTextSelector)[0].getText()).toContain(newLabel);
    });

    it('should not update the textfield on cancel', () => {
        editableText[0].click();
        editableText[0].$('input').setValue(originalValue);
        browser.click(cancelEdit);

        // Should contain the new label from the prior test
        expect(editableText[0].getText()).toContain(newLabel);
    });
});
