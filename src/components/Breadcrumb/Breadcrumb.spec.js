const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Breadcrumb Suite', () => { 
    const component = 'Breadcrumb';
    const childStories = ['Basic Breadcrumb', 'Breadcrumb with custom label', 'Breadcrumb with editable text'];
    const link = '[data-qa-link]';
    const staticText = '[data-qa-label-title]';
    const editableText = '[data-qa-editable-text]';
    const editableTextInput = `${editableText} input`;
    const editButton = '[data-qa-edit-button]';
    const saveEditButton = '[data-qa-save-edit]';
    const clearEditButton = '[data-qa-cancel-edit]';

    // it('There should be a link in each Breadcrumb story', () => {
    //     executeInAllStories(component, childStories, () => {
    //         $(link).waitForVisible(constants.wait.normal);
    //         expect($(link).getAttribute('href')).not.toBeNull();
    //     });
    // });

    // it('Static text is not editable, and does not contain link', () => {
    //     navigateToStory(component, childStories[0]);
    //     expect($(editButton).isVisible()).toBe(false);
    //     expect($(staticText).$('..').$('..').getAttribute('href')).toBeNull();
    // });

    // it('Static text is not editable, and does contain link', () => {
    //     navigateToStory(component, childStories[1]);
    //     expect($(editButton).isVisible()).toBe(false);
    //     expect($(staticText).$('..').$('..').getAttribute('href')).not.toBeNull();
    // });

    // it('Editable text header should be editable, but not contain a link', () => {
    //     navigateToStory(component, childStories[2]);
    //     expect($(editButton)).not.toBeNull();
    //     expect($(editableText).$('..').getAttribute('href')).toBeNull();
    // });

    // it('Editable text header should be editable, and does a link', () => {
    //     navigateToStory(component, childStories[3]);
    //     expect($(editButton)).not.toBeNull();
    //     expect($(editableText).$('..').getAttribute('href')).not.toBeNull();
    //     expect($(editableText).$('..').getAttribute('class')).toContain('underlineOnHover');
    // });

    // it('Only clicking the edit icon displays the edit input field', () => {
    //     executeInAllStories(component, [childStories[2], childStories[3]], () => {
    //         $(editableText).waitForVisible(true);
    //         $(editableText).click();
    //         expect($(editableTextInput).isVisible()).toBe(false);
    //         $(editButton).click();
    //         $(editableTextInput).waitForVisible(constants.wait.short);
    //     });
    // });

    // it('Text input field should have a save a clear button', () => {
    //     executeInAllStories(component, [childStories[2], childStories[3]], () => {
    //         $(editableText).waitForVisible(constants.wait.short);
    //         browser.moveToObject(editableText);
    //         $(editButton).click();
    //         expect($(editableTextInput).isVisible()).toBe(true);
    //         expect($(saveEditButton).isVisible()).toBe(true);
    //         expect($(clearEditButton).isVisible()).toBe(true);
    //         $('body').click();
    //     });
    // });

    // it('Clicking the clear button clears the text input', () => {
    //     executeInAllStories(component, [childStories[2], childStories[3]], () => {
    //         $(editableText).waitForVisible(constants.wait.short);
    //         const originalValue = $(editableText).getText();
    //         browser.moveToObject(editableText);
    //         $(editButton).click();
    //         $(editableTextInput).waitForVisible(constants.wait.short);
    //         $(editableTextInput).setValue('test clear');
    //         $(clearEditButton).click();
    //         expect($(editableText).getText()).toEqual(originalValue);
    //     });
    // });

    // it('Clicking the save button saves the text input', () => {
    //     executeInAllStories(component, [childStories[2], childStories[3]], () => {
    //         $(editableText).waitForVisible(constants.wait.short);
    //         const updatedText = 'test save';
    //         browser.moveToObject(editableText);
    //         $(editButton).click();
    //         $(editableTextInput).waitForVisible(constants.wait.short);
    //         $(editableTextInput).setValue(updatedText);
    //         $(saveEditButton).click();
    //         expect($(editableText).getText()).toEqual(updatedText);
    //     });
    // });

    // it('Clicking out of the editable input without saving does not save the text input', () => {
    //     executeInAllStories(component, [childStories[2], childStories[3]], () => {
    //         $(editableText).waitForVisible(constants.wait.short);
    //         const originalText = $(editableText).getText();
    //         browser.moveToObject(editableText);
    //         $(editButton).click();
    //         $(editableTextInput).waitForVisible(constants.wait.short);
    //         $(editableTextInput).setValue('test do not save input');
    //         $('body').click();
    //         expect($(editableText).getText()).toEqual(originalText);
    //     });
    // });
});
