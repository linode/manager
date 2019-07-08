const { constants } = require('../../../e2e/constants');
const { navigateToStory, executeInAllStories } = require('../../../e2e/utils/storybook');

describe('Button Suite', () => {
    const component = 'Button';
    const childStories = [
        'Types',
        'Disabled',
        'Primary Dropdown',
        'Secondary Dropdown',
        'Destructive',
    ]
    const button = {
        generic: '[data-qa-button]',
        primary: '[data-qa-button="primary"]',
        secondary: '[data-qa-button="secondary"]',
        primaryDropdown:  '[data-qa-button="Primary Dropdown"]',
        secondaryDropdown: '[data-qa-button="Secondary Dropdown"]',
        destructive: '[data-qa-button="Destructive"]',
    }

    it('should display buttons in each story', () => {
        executeInAllStories(component, childStories, () => {
            $('[data-qa-button]').waitForDisplayed(constants.wait.normal)
            const buttons = $$(button.generic);
            buttons.forEach(b => expect(b.isDisplayed()).toBe(true));
        });
    });

    describe('Types Button Suite', () => {
        let primaryButtons, secondaryButtons;

        beforeAll(() => {
            navigateToStory(component, childStories[1]);
        });

        it('should display primary button', () => {
            $(button.primary).waitForDisplayed(constants.wait.normal);

            primaryButtons = $$(button.primary);
            expect(primaryButtons.length).toBe(1);
        });

        it('should display primary buttons with white text', () => {
            primaryButtons.forEach(button => {
                expect(button.getCSSProperty('color').parsed.hex.includes('#ffffff'))
            });
        });

        it('should have primary included in the class of each button', () => {
             primaryButtons.forEach(button => {
                expect(button.getAttribute('class').includes('Primary')).toBe(true);
            });
         });

        it('should display secondary button', () => {
            const secondaryButton = $(button.secondary);
            secondaryButtons = $$(button.secondary);

            expect(secondaryButton.isDisplayed()).toBe(true);
            expect(secondaryButtons.length).toBe(1);
        });

       it('should display buttons with transparent backgrounds', () => {
           secondaryButtons.forEach(button => {
               expect(button.getCSSProperty('background-color').parsed.hex.includes('#000000')).toBe(true)
            });
       });

       it('should have secondary included in class of each button', () => {
           secondaryButtons.forEach(button => {
               expect(button.getAttribute('class').includes('Secondary')).toBe(true);
           });
       });
    });

    describe('Primary Dropdown', () => {
        let primaryDowndowns;

        beforeAll(() => {
            navigateToStory(component, childStories[2]);
            $(button.generic).waitForDisplayed(constants.wait.normal);
        });

        it('should display dropdown buttons with carat', () => {
            primaryDropdowns = $$(button.primaryDropdown);
            primaryDropdowns.forEach(d => {
                expect(d.$('svg').isVisible()).toBe(true);
            });
        });

        it('should have primary included in class of each dropdown', () => {
            primaryDropdowns.forEach(d => {
                expect(d.getAttribute('class').includes('Primary')).toBe(true);
            });
        });
    });

    describe('Secondary Dropdown', () => {
        let secondaryDropdowns;

        beforeAll(() => {
            navigateToStory(component, childStories[3]);
            browser.waitForVisible(button.generic);
        })

        it('should display dropdown buttons with carat', () => {
            secondaryDropdowns = $$(button.secondaryDropdown);
            secondaryDropdowns.forEach(s => {
                expect(s.$('svg').isVisible()).toBe(true);
            });
        });

        it('should have secondary included in class of each dropdown', () => {
            secondaryDropdowns.forEach(d => {
                expect(d.getAttribute('class').includes('Secondary')).toBe(true);
            });
        });
    });

    xdescribe('Destructive Button', () => {

        beforeAll(() => {
            navigateToStory(component, childStories[4]);
        });

        let destructiveButtons;

        it('should display an enabled destructive button and a disabled button', () => {
            destructiveButtons = $$(button.destructive);
            const disabledButtons = destructiveButtons.filter(d => d.getAttribute('disabled') !== null);

            destructiveButtons.forEach(d => {
                expect(d.isVisible()).toBe(true);
            });
            expect(disabledButtons.length).toBe(1);
        });
    });

    xdescribe('Disabled Button', () => {
        let secondaryDropdowns;

        it('should display one disabled button', () => {
            disabledDropdowns = secondaryDropdowns.filter(s => s.getAttribute('disabled') !== null);
            expect(disabledDropdowns.length).toBe(1);
        });

    });
});
