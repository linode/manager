/**
 * @file Integration tests for account two-factor authentication functionality.
 */

import { randomNumber, randomLabel, randomString } from 'support/util/random';
import {
  mockGetProfile,
  interceptEnableTwoFactorAuth,
} from 'support/intercepts/profile';
import { profileFactory } from 'src/factories/profile';
import { ui } from 'support/ui';

const getTwoFactorSection = (): Cypress.Chainable => {
  return cy.contains('h3', 'Two-Factor Authentication (2FA)').parent();
};

const invalidTokenError =
  'Invalid token. Two-factor auth not enabled. Please try again.';

describe('Two-factor authentication', () => {
  it('can enable two factor authentication', () => {
    const invalidToken = randomString(6);
    const validToken = randomString(6);

    const userProfile = profileFactory.build({
      uid: randomNumber(1000, 9999),
      username: randomLabel(),
      verified_phone_number: undefined,
      two_factor_auth: false,
    });

    mockGetProfile(userProfile).as('getProfile');
    cy.visitWithLogin('/profile/auth');
    cy.wait('@getProfile');

    getTwoFactorSection().within(() => {
      interceptEnableTwoFactorAuth().as('enableTwoFactorAuth');
      // Confirm that 2FA is disabled, and click the toggle button.
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'false')
        .should('be.visible')
        .click();

      cy.wait('@enableTwoFactorAuth');

      cy.get('[data-qa-qr-code]').should('be.visible');

      cy.findByLabelText('Token').should('be.visible').type('123456');

      ui.button
        .findByTitle('Confirm Token')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.findByText(invalidTokenError).should('be.visible');
    });
  });
});
