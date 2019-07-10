const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Editable Text Suite', () => {
    const component = 'Editable Text';
    const childStories = [
        'Headline %26 Title',
    ];

    const editableTextField = '[data-testid="editable-text"]';
    const editableTextButton = '[data-qa-edit-button=true]';
    const editField = '[data-qa-edit-field="true"]';
    const saveEdit = '[data-qa-save-edit="true"]';
    const cancelEdit = '[data-qa-cancel-edit="true"]';
    const newLabel = 'someNewValue!';

    let originalLabel;

    beforeAll(() => {
        navigateToStory(component, childStories[0]);
        console.log('waiting for Editiable text field')
        $(editableTextField).waitForDisplayed();
        console.log('text field found')
    });

    it('should become an editable field on click', () => {
        //browser.debug()
        originalLabel = $(editableTextField).getText();
        console.log(`orginal text: ${originalLabel}\n   Moving to text field`)
        $(editableTextField).click()
        $(editableTextButton).waitForDisplayed();

        $(editableTextButton).click();
        $(editField).waitForDisplayed();
    });

    it('should edit the textfield', () => {
        $(editField).$('input').setValue(newLabel);
        $(saveEdit).click();
        expect($(editableTextField).getText()).toBe(newLabel);
    });

    it('should not update the textfield on cancel', () => {
        $(editableTextField).click()
        $(editableTextButton).waitForDisplayed();

        $(editableTextButton).click();
        $(cancelEdit).waitForDisplayed();

        $(editField).$('input').setValue(originalLabel);
        $(cancelEdit).click();

        // Should contain the new label from the prior test
        expect($(editableTextField).getText()).toBe(newLabel);
    });
});
