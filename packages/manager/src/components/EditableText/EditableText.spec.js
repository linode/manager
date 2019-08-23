const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Editable Text', () => {
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
    const shouldString = 'should have been';
    const shouldNotString = 'should not have been'


    let originalLabel;

    beforeEach(() => {
        navigateToStory(component, childStories[0]);
        $(editableTextField).waitForDisplayed();
    });

    it('should become an editable field on click', () => {
        originalLabel = $(editableTextField).getText();
        //checking that editable text values are not displayed
        expect($(editField).isDisplayed())
          .withContext(`Edit field ${shouldNotString} enabled`).toBe(false);
        expect($(saveEdit).isDisplayed())
          .withContext(`Save button ${shouldNotString} enabled`).toBe(false);
        expect($(cancelEdit).isDisplayed())
          .withContext(`Cancel button ${shouldNotString} enabled`).toBe(false);
        $(editableTextField).click();
        //Edit text button should be displayed after clicking editable text
        expect($(editableTextButton).isDisplayed())
          .withContext(`Edit text ${shouldString} displayed`).toBe(true);
        $(editableTextButton).click();
        $(editField).waitForDisplayed();
        //checking that edit field is enabled and save and cancel buttons are displayed
        expect($(editField).isEnabled())
          .withContext(`Edit field ${shouldString} enabled`).toBe(true);
        expect($(saveEdit).isDisplayed())
          .withContext(`Save button ${shouldString} displayed`).toBe(true);
        expect($(cancelEdit).isDisplayed())
          .withContext(`Cancel button ${shouldString} displayed`).toBe(true);
    });

    it('should edit the text field with save button', () => {
        setUpEditField();
        browser.setNewValue(`${editField} input`, newLabel);
        $(saveEdit).click();
        //check that the edit field value is set correctly
        expect($(editableTextField).getText())
          .withContext(`Field text ${shouldString}: '${newLabel}'`).toBe(newLabel);
    });

    it('should edit the text field with the enter key', () => {
        setUpEditField();
        browser.setNewValue(`${editField} input`, newLabel);
        browser.keys('\uE007');
        //check that the edit field value is set correctly
        expect($(editableTextField).getText())
          .withContext(`Field text ${shouldString}: '${newLabel}'`).toBe(newLabel);
    });

    it('should not update the text field on cancel', () => {
        originalLabel = $(editableTextField).getText();
        setUpEditField()
        $(cancelEdit).waitForDisplayed();
        browser.setNewValue(`${editField} input`, 'sadfgertg');
        $(cancelEdit).click();
        // Should contain the new label from the prior test
        expect($(editableTextField).getText())
          .withContext(`Field text ${shouldString}: '${originalLabel}'`).toBe(originalLabel);
    });

    function setUpEditField(){
        $(editableTextField).click();
        //Edit text button should be displayed after clicking editable text
        $(editableTextButton).waitForDisplayed(1000);
        expect($(editableTextButton).isDisplayed())
          .withContext(`Edit text ${shouldString} displayed`).toBe(true);
        $(editableTextButton).click();
        $(editField).waitForDisplayed();
        //checking that edit field is enabled and save and cancel buttons are displayed
        expect($(editField).isEnabled())
          .withContext(`Edit field ${shouldString} enabled`).toBe(true);
        expect($(saveEdit).isDisplayed())
          .withContext(`Save button ${shouldString} displayed`).toBe(true);
        expect($(cancelEdit).isDisplayed())
          .withContext(`Cancel button ${shouldString} displayed`).toBe(true);
    }
});
