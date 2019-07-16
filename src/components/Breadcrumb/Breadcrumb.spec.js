const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Breadcrumb Suite', () => { 
    const component = 'Breadcrumb';
    const childStories = ['Basic Breadcrumb', 'Breadcrumb with custom label', 'Breadcrumb with editable text'];
    const link = '[data-qa-link="true"]';
    const staticText = '[data-qa-label-text="true"]';
    const editableText = '[data-qa-editable-text="true"]';
    const editableTextInput = `${editableText} input`;
    const editButton = '[data-testid="editable-text"]';
    const saveEditButton = '[data-qa-save-edit="true"]';
    const cancelButton = '[data-qa-cancel-edit="true"]';
    const editBtnMessage = 'edit button should not be displayed'

    it('There should be a link in each Breadcrumb story', () => {
        executeInAllStories(component, childStories, () => {
            $(link).waitForDisplayed(constants.wait.normal);
            expect($(link).getAttribute('href'))
            .withContext(`href link should not be missing`).not.toBeNull();
        });
    });

    it('Static text is not editable, and does not contain link', () => {
        navigateToStory(component, childStories[0]);
        expect($(editButton).isDisplayed())
        .withContext(`${editBtnMessage}`).toBe(false);
        expect($(staticText).$('..').$('..').getAttribute('href'))
        .withContext(`href link should be blank`).toBeNull();
    });

    it('Static text is not editable, and does contain link', () => {
        navigateToStory(component, childStories[1]);
        expect($(editButton).isDisplayed())
        .withContext(`${editBtnMessage}`).toBe(false);
        //let textLink = $$(link)[2].getAttribute('href')
        expect($$(link)[2].getAttribute('href'))
        //expect($(staticText).$('..').$('..').getAttribute('href'))
        .withContext(`href link should not be blank`).not.toBeNull();
    });

    it('Editable text header should be editable, but not contain a link', () => {
        navigateToStory(component, childStories[2]);
        expect($(editButton)).
        withContext(`edit button should be visible`).not.toBeNull();
        expect($(editableText).$('..').getAttribute('href'))
        .withContext(`href link should be blank`).toBeNull();
    });

    it('Editable text header should be editable, and does a link', () => {
        navigateToStory(component, childStories[3]);
        expect($(editButton))
        .withContext(`edit button should be displayed`).not.toBeNull();
        expect($(editableText).$('..').getAttribute('href'))
        .withContext(`href link should not be blank`).not.toBeNull();
        expect($(editableText).$('..').getAttribute('class'))
        .withContext(`editable text should be underlined on hover`).toContain('underlineOnHover');
    });

    it('Only clicking the edit icon displays the edit input field', () => {
        executeInAllStories(component, [childStories[2], childStories[3]], () => {
            $(editableText).waitForDisplayed(true);
            $(editableText).click();
            expect($(editableTextInput).isDisplayed())
            .withContext(`text field should not be displayed`).toBe(false);
            $(editButton).click();
            $(editableTextInput).waitForDisplayed(constants.wait.short);
        });
    });

    it('Text input field should have a save and close button', () => {
        executeInAllStories(component, [childStories[2], childStories[3]], () => {
            $(editableText).waitForDisplayed(constants.wait.short);
            $(editableText).click();
            $(editButton).click();
            expect($(editableTextInput).isDisplayed())
            .withContext(`editable text field should displayed`).toBe(true);
            expect($(saveEditButton).isDisplayed())
            .withContext(`save edit button should be displayed`).toBe(true);
            expect($(cancelButton).isDisplayed())
            .withContext(`cancel button should be displayed`).toBe(true);
            $('body').click();
        });
    });

    it('Clicking the cancel button clears the text input', () => {
        executeInAllStories(component, [childStories[2], childStories[3]], () => {
            $(editableText).waitForDisplayed(constants.wait.short);
            const originalValue = $(editableText).getText();
            $(editableText).click();
            $(editButton).click();
            $(editableTextInput).waitForDisplayed(constants.wait.short);
            $(editableTextInput).setValue('test clear');
            $(cancelButton).click();
            expect($(editableText).getText())
            .withContext(`text should not be changed on cancel`).toEqual(originalValue);
        });
    });

    it('Clicking the save button saves the text input', () => {
        executeInAllStories(component, [childStories[2], childStories[3]], () => {
            $(editableText).waitForDisplayed(constants.wait.short);
            const updatedText = 'test save';
            $(editableText).click();
            $(editButton).click();
            $(editableTextInput).waitForDisplayed(constants.wait.short);
            $(editableTextInput).setValue(updatedText);
            $(saveEditButton).click();
            expect($(editableText).getText())
            .withContext(`text should have been updated`).toEqual(updatedText);
        });
    });

    it('Clicking out of the editable input without saving does not save the text input', () => {
        executeInAllStories(component, [childStories[2], childStories[3]], () => {
            $(editableText).waitForDisplayed(constants.wait.short);
            const originalText = $(editableText).getText();
            $(editableText).click();
            $(editButton).click();
            $(editableTextInput).waitForDisplayed(constants.wait.short);
            $(editableTextInput).setValue('test do not save input');
            $('body').click();
            expect($(editableText).getText())
            .withContext(`text should have been saved`).toEqual(originalText);
        });
    });
});
