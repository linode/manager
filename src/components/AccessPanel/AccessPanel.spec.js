const { navigateToStory } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Access Panel Suite', () => {
    const component = 'Access Panel';
    const childStories = ['Password Access', 'Password and SSH Key Access'];
    const passwordRegion = '[data-qa-password-input]';

    describe('Password Access Suite', () => {
      const passwordstrength = '[data-qa-password-strength]';
      const passwordInput = `${passwordRegion} input`;
      const hideShowPassword = '[data-qa-hide] svg';

        beforeAll(() => {
            navigateToStory(component, childStories[0])
            const passwordElem = $(passwordRegion);
            passwordElem.waitForDisplayed(constants.wait.normal);
        });

        it('there should be a root password input field', () => {
            expect($(passwordInput).isDisplayed()).toBe(true);
            expect($(`${passwordRegion} label`).getText()).toEqual('Root Password')
        });

        it('there should be an icon to show plain text password, but should be hidden by default', ()=> {
            expect($(hideShowPassword).isDisplayed()).toBe(true);
            expect($(passwordInput).getAttribute('type')).toEqual('password');
        });

        it('password input changes to text type when show password option is selected', ()=> {
            $(hideShowPassword).click();
            expect($(passwordInput).getAttribute('type')).toEqual('text');
            //Hide for remaining tests
            $(hideShowPassword).click();
        });

        it('there should be a password strength indicator', () => {
            expect($(passwordstrength).isDisplayed()).toBe(true);
        });

        it('password strength indicator updates on input', () => {
            const passwords = [{password: 'password', strength: 'Weak'},
                {password: '12345test!', strength: 'Fair'},
                {password: '9]%3%7?98+n[', strength: 'Good'}
            ];

            passwords.forEach((passwordEntry) => {
                $(passwordInput).setValue(passwordEntry.password);
                expect($(passwordstrength).getText()).toEqual(`Strength: ${passwordEntry.strength}`);
            });
        });
    });

    describe('Password and SSH Key Access Suite', () =>{
        const sshKeysTable = '[data-qa-table=\"SSH Keys\"]';
        const userTableHeader = '[data-qa-table-header=\"User\"]';
        const checkboxAttribute = 'data-qa-checked'
        const checkboxes = `[${checkboxAttribute}]`;

        function checkAllBoxes(checkOrUnchecked){
            $$(checkboxes).forEach((checkbox) => {
                checkbox.click();
                expect(checkbox.getAttribute(checkboxAttribute)).toEqual(checkOrUnchecked.toString());
            });

        }

        beforeAll(() => {
            navigateToStory(component, childStories[1])
            $(passwordRegion).waitForDisplayed(constants.wait.normal);
        });

        it('there should be an ssh key table', () => {
            expect($(sshKeysTable).isDisplayed()).toBe(true);
            expect($(sshKeysTable).getText()).toEqual('SSH Keys');
        });

        it('the table should have a checkbox column, User column, and a SSH Keys column', () => {
            const sshKeysHeader = '[data-qa-table-header=\"SSH Keys\"]';

            expect($(userTableHeader).isDisplayed()).toBe(true);
            expect($(userTableHeader).getText()).toEqual('User');

            expect($(sshKeysHeader).isDisplayed()).toBe(true);
            expect($(sshKeysHeader).getText()).toEqual('SSH Keys');

            expect($$(checkboxes).length).toEqual(3);
        });

        it('the checkboxes are clickable', () => {
            checkAllBoxes(true);
            checkAllBoxes(false);
        });
    });

});
