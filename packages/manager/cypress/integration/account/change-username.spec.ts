import { getProfile } from '../../support/api/account';
import { fbtVisible, getVisible } from '../../support/helpers';
const testText = 'testing123';

describe('username', () => {
  it('can type new username', () => {
    cy.intercept('GET', '*/profile/logins').as('getLogin');
    cy.intercept('GET', '*/object-storage/clusters').as('getClusters');
    // cy.visitWithLogin(`/dashboard`);
    getProfile().then(profile => {
      const username = profile.body.username;
      cy.visitWithLogin(`account/users/${username}`);
      fbtVisible('Username');
      fbtVisible('Email');
      fbtVisible('Delete User');
      getVisible('[id="username"]')
        .clear()
        .type(testText);
      getVisible('[id="username"]').should('have.value', testText);
    });
  });
});
