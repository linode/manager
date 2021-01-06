import { getProfile } from '../../support/api/account';
import { fbtVisible } from '../../support/helpers';
import { waitForAppLoad } from '../../support/ui/common';
const testText = 'testing123';

describe('username', () => {
  it('can type new username', () => {
    cy.visitWithLogin(`/dashboard`);
    getProfile().then(profile => {
      const username = profile.body.username;
      waitForAppLoad(`account/users/${username}`, false);
      fbtVisible('Username');
      fbtVisible('Username');
      cy.get('[data-testid="textfield-input"]')
        .first()
        .click()
        .clear()
        .type(testText);
      cy.get('[data-testid="textfield-input"]')
        .first()
        .should('have.value', testText);
    });
  });
});
