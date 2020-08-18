import { getProfile } from '../../support/api/account';
import { waitForAppLoad } from '../../support/ui/common';
const testText = 'testing123';

describe('username', () => {
  it('can type new username', () => {
    cy.visitWithLogin(`/dashboard`);
    getProfile().then(profile => {
      const username = profile.body.username;
      cy.server();
      cy.route({
        method: 'GET',
        url: '*/account/events'
      }).as('textAvailable');
      waitForAppLoad(`account/users/${username}`, false);
      cy.findByText('Username').should('be.visible');
      cy.wait('@textAvailable');
      cy.findByLabelText('Username').type(testText);
      cy.get('[data-testid="textfield-input"]').should(
        'have.value',
        `${username}${testText}`
      );
    });
  });
});
