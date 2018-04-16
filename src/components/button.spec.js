const { waitForFocus, executeInAllStories } = require('../../e2e/utils/storybook');

describe('Button Suite', () => {
    const menuItem = '[data-name="Button"]';
    const childStories = [
        '[data-name="Primary"]', '[data-name="Secondary"]',
        '[data-name="Primary Dropdown"]', '[data-name="Secondary Dropdown"]',
        '[data-name="Destructive"]'
    ]
    const button = {
        generic: '[data-qa-button]',
        primary: '[data-qa-button="primary"]',
        secondary: '[data-qa-button="secondary"]',
        primaryDropdown:  '[data-qa-button="dropdown"]',
        secondaryDropdown: '[data-qa-button="dropdown-secondary"]',
        destructive: '[data-qa-button="destructive"]',
    }

    it('should display button component in navigation', () => {
        const buttonNavItem = $(menuItem);
        expect(buttonNavItem.isVisible()).toBe(true);
    });

    it('should display child stories in navigation', () => {
        browser.click(menuItem);

        childStories.forEach(story => {
            expect($(story).waitForVisible()).toBe(true)
        });
    });

    it('should display buttons in each story', () => {
        executeInAllStories(childStories, () => {
            const buttons = $$(button.generic);
            buttons.forEach(b => expect(b.isVisible()).toBe(true));
        });
    });

    describe('Primary Button Suite', () => {
        let primaryButtons;

        beforeAll(() => {
            browser.click(childStories[0]);
        })

        it('should display primary buttons with one enabled and one disabled', () => {
            waitForFocus(button.primary);

            primaryButtons = $$(button.primary);
            const disabledButtons = primaryButtons.filter(b => b.getAttribute('disabled') !== null);
            
            expect(primaryButtons.length).toBe(2);
            expect(disabledButtons.length).toBe(1);
        });

        it('should display primary buttons with white text', () => {
            primaryButtons.forEach(button => {
                expect(button.getCssProperty('color').parsed.hex.includes('#ffffff'))
            });
        });

        it('should have primary included in the class of each button', () => {
             primaryButtons.forEach(button => {
                expect(button.getAttribute('class').includes('Primary')).toBe(true);
            });
         }); 
    });

    describe('Secondary Button Suite', () => {
       let secondaryButtons;

       beforeAll(() => {
            browser.frame();
            browser.click(childStories[1]);
            waitForFocus(button.generic);
       });

       it('should display secondary buttons with one enabled and one disabled', () => {
            secondaryButtons = $$(button.secondary);
            const disabledButtons = secondaryButtons.filter(b => b.getAttribute('disabled') !== null);
            
            expect(secondaryButtons.length).toBe(2);
            expect(disabledButtons.length).toBe(1);
        }); 

       it('should display buttons with transparent backgrounds', () => {
           secondaryButtons.forEach(button => {
               expect(button.getCssProperty('background-color').parsed.hex.includes('#000000')).toBe(true)
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
            browser.frame();
            browser.click(childStories[2]);
            waitForFocus(button.primaryDropdown);
        });

        it('should display dropdown buttons with carat', () => {
            primaryDropdowns = $$(button.primaryDropdown);
            primaryDropdowns.forEach(d => {
                expect(d.$('svg').isVisible()).toBe(true);
            });
        });

        it('should display one disabled dropdown', () => {
            const disabledDropdowns = primaryDropdowns.filter(d => d.getAttribute('disabled') !== null);
            expect(disabledDropdowns.length).toBe(1);
        });

        it('should have primary included in class of each dropdown', () => {
            primaryDropdowns.forEach(d => {
                expect(d.getAttribute('class').includes('Primary')).toBe(true);
            });
        });
    });

    describe('Secondary Dropdown', () => {
        let secondaryDropdowns, disabledDropdowns;

        beforeAll(() => {
            browser.frame();
            browser.click(childStories[3]);
            waitForFocus(button.secondaryDropdown);
        })

        it('should display dropdown buttons with carat', () => {
            secondaryDropdowns = $$(button.secondaryDropdown);
            secondaryDropdowns.forEach(s => {
                expect(s.$('svg').isVisible()).toBe(true);
            });
        });

        it('should display one disabled button', () => {
            disabledDropdowns = secondaryDropdowns.filter(s => s.getAttribute('disabled') !== null);
            expect(disabledDropdowns.length).toBe(1);
        });

        it('should have secondary included in class of each dropdown', () => {
            disabledDropdowns.forEach(d => {
                expect(d.getAttribute('class').includes('Secondary')).toBe(true);
            });
        });
    });

    describe('Destructive Button', () => {

        beforeAll(() => {
            browser.frame();
            browser.click(childStories[4]);
            waitForFocus(button.destructive);
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
});
