const { navigateToStory } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Breadcrumb Suite', () => {
    const component = 'Breadcrumb';
    const childStories = ['Static text', 'Static text with label link', 'Editable text', 'Editable text with label link'];
    const link = '[data-qa-link]';
    const staticText = '[data-qa-static-text]';
    const editableText = '[data-qa-editable-text]';
    const editableTextInput = `${editableText} input`;
    const editButton = '[data-qa-edit-button]';
    const saveEditButton = '[data-qa-save-edit]';
    const clearEditButton = '[data-qa-cancel-edit]';

    const checkBreadcrumbLink = () => {
        expect($(link).isVisible()).toBe(true);
        expect($(link).getAttribute('href')).not.toBeNull();
        expect($(link).getCssProperty('color').parsed.hex).toEqual('#3683dc');
    }

    const onlyClickingEditIconDisplaysInput = () => {
        $(editableText).click();
        expect($(editableTextInput).isVisible()).toBe(false);
        $(editButton).click();
        $(editableTextInput).waitForVisible(constants.wait.short);
        expect($(editableTextInput).isVisible()).toBe(true);
    }

    const inputFieldContainsClearAndSaveWithBlueBorder = () => {
        expect($(saveEditButton).isVisible()).toBe(true);
        expect($(clearEditButton).isVisible()).toBe(true);
        expect($(editableTextInput).$('..').getCssProperty('border-color').parsed.hex).toEqual('#3683dc');
        $('body').click();
    }

    const clearInput = () => {
        const originalValue = $(editableText).getText();
        browser.moveToObject(editableText);
        $(editButton).click();
        $(editableTextInput).waitForVisible(constants.wait.short);
        $(editableTextInput).setValue('test clear');
        $(clearEditButton).click();
        expect($(editableText).getText()).toEqual(originalValue);
    }

    const saveInput = () => {
        const updatedText = 'test save';
        browser.moveToObject(editableText);
        $(editButton).click();
        $(editableTextInput).waitForVisible(constants.wait.short);
        $(editableTextInput).setValue(updatedText);
        $(saveEditButton).click();
        expect($(editableText).getText()).toEqual(updatedText);
    }

    const enterInputDoNotSave = () => {
        const originalText = $(editableText).getText();
        browser.moveToObject(editableText);
        $(editButton).click();
        $(editableTextInput).waitForVisible(constants.wait.short);
        $(editableTextInput).setValue('test do not save input');
        $('body').click();
        expect($(editableText).getText()).toEqual(originalText);
    }

    describe('Static Text Suite', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[0], () => {
                browser.waitForVisible(linkText, constants.wait.normal);
            });
        });

        it('Breadcrumb component should display a link in blue text', () => {
            checkBreadcrumbLink();
        });

        it('Static text header should not contain a link or be editable', () => {
            expect($(editButton).isVisible()).toBe(false);
            expect($(staticText).$('..').$('..').getAttribute('href')).toBeNull();
        });
    });

    describe('Static text with label link', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[1], () => {
                browser.waitForVisible(linkText, constants.wait.normal);
            });
        });

        it('Breadcrumb component should display a link in blue text', () => {
            checkBreadcrumbLink();
        });

        it('Static text header should contain a link, but is not editable', () => {
            expect($(editButton).isVisible()).toBe(false);
            expect($(staticText).$('..').$('..').getAttribute('href')).not.toBeNull();
            expect($(staticText).$('..').getAttribute('class')).toContain('underlineOnHover');
        });
    });

    describe('Editable Text', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[2], () => {
                browser.waitForVisible(linkText, constants.wait.normal);
            });
        });

        it('Breadcrumb component should display a link in blue text', () => {
            checkBreadcrumbLink();
        });

        it('Editable text header should be editable, but not contain a link', () => {
            expect($(editButton)).not.toBeNull();
            expect($(editableText).$('..').getAttribute('href')).toBeNull();
        });

        it('Only clicking the edit icon displays the edit input field', () => {
            onlyClickingEditIconDisplaysInput();
        });

        it('Text input field should have a save a clear button, and a blue border', () => {
            inputFieldContainsClearAndSaveWithBlueBorder();
        });

        it('Clicking the clear button clears the text input', () => {
            clearInput();
        });

        it('Clicking the save button saves the text input', () => {
            saveInput();
        });

        it('Clicking out of the editable input without saving does not save the text input', () => {
            enterInputDoNotSave();
        });
    });

    describe('Editable Text with label link', () => {
        beforeAll(() => {
            navigateToStory(component, childStories[3], () => {
                browser.waitForVisible(linkText, constants.wait.normal);
            });
        });

        it('Breadcrumb component should display a link in blue text', () => {
            checkBreadcrumbLink();
        });

        it('Editable text header should be editable and contain a link', () => {
            expect($(editButton)).not.toBeNull();
            expect($(editableText).$('..').getAttribute('href')).not.toBeNull();
            expect($(editableText).$('..').getAttribute('class')).toContain('underlineOnHover');
        });

        it('Only clicking the edit icon displays the edit input field', () => {
            onlyClickingEditIconDisplaysInput();
        });

        it('Text input field should have a save a clear button, and a blue border', () => {
            inputFieldContainsClearAndSaveWithBlueBorder();
        });

        it('Clicking the clear button clears the text input', () => {
            clearInput();
        });

        it('Clicking the save button saves the text input', () => {
            saveInput();
        });

        it('Clicking out of the editable input without saving does not save the text input', () => {
            enterInputDoNotSave();
        });
    });
});
