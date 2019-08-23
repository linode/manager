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
      expect($(passwordInput).isDisplayed())
        .withContext(`Password input should be displayed`).toBe(true);
      expect($(`${passwordRegion} label`).getText())
        .withContext(`Password input label is incorrect`).toEqual('Root Password')
    });

    it('there should be an icon to show plain text password, but should be hidden by default', ()=> {
      expect($(hideShowPassword).isDisplayed())
        .withContext(`Password should be hidden`).toBe(true);
      expect($(passwordInput).getAttribute('type'))
        .withContext(`Incorrect password input type`).toEqual('password');
    });

    it('password input changes to text type when show password option is selected', ()=> {
      $(hideShowPassword).click();
      expect($(passwordInput).getAttribute('type'))
        .withContext(`Incorrect password type`).toEqual('text');
      //Hide for remaining tests
      $(hideShowPassword).click();
    });

    it('there should be a password strength indicator', () => {
      expect($(passwordstrength).isDisplayed())
        .withContext(`Password strength indicator should be displayed`).toBe(true);
    });

    it('password strength indicator updates on input', () => {
      const passwords = [
        { password: 'password', strength: 'Weak' },
        { password: '12345test!', strength: 'Fair' },
        { password: '9]%3%7?98+n[', strength: 'Good' }
      ];

      passwords.forEach((passwordEntry) => {
        browser.setNewValue(passwordInput, passwordEntry.password);
        expect($(passwordstrength).getText())
          .withContext(`Incorrect strength value`)
          .toEqual(`Strength: ${passwordEntry.strength}`);
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
        expect(checkbox.getAttribute(checkboxAttribute))
          .withContext(`Incorrect attribute`).toEqual(checkOrUnchecked.toString());
      });
    }

    beforeAll(() => {
      navigateToStory(component, childStories[1])
      $(passwordRegion).waitForDisplayed(constants.wait.normal);
    });

    it('there should be an ssh key table', () => {
      expect($(sshKeysTable).isDisplayed())
        .withContext(`ssh key table should be displayed`).toBe(true);
      expect($(sshKeysTable).getText())
        .withContext(`Incorrect ssh key text`).toEqual('SSH Keys');
    });

    it('the table should have a checkbox column, User column, and a SSH Keys column', () => {
      const sshKeysHeader = '[data-qa-table-header=\"SSH Keys\"]';

      expect($(userTableHeader).isDisplayed())
        .withContext(`User header should be displayed`).toBe(true);
      expect($(userTableHeader).getText())
        .withContext(`Incorrect header text value`).toEqual('User');

      expect($(sshKeysHeader).isDisplayed())
        .withContext(`ssh key header should be displayed`).toBe(true);
      expect($(sshKeysHeader).getText())
        .withContext(`Incorrect ssh key text`).toEqual('SSH Keys');

      expect($$(checkboxes).length)
        .withContext(`expected 3 checkboxes`).toEqual(3);
    });

    it('the checkboxes are clickable', () => {
      checkAllBoxes(true);
      checkAllBoxes(false);
    });
  });
});
