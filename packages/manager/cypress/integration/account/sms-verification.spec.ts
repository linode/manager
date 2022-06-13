/**
 * @file Integration tests for SMS phone verification.
 */

import { profileFactory } from 'src/factories/profile';
import {
  randomLabel,
  randomNumber,
  randomPhoneNumber,
} from 'support/util/random';
import {
  mockGetProfile,
  mockSmsVerificationOptOut,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { assertToast } from 'support/ui/events';

describe('SMS phone verification', () => {
  /*
   * - Validates SMS phone verification opt-out flow using mocked data.
   * - Confirms that user is shown message telling them they are opted in.
   * - Confirms that user can opt out by clicking 'Opt Out'
   * - Confirms that user is then shown message telling them they are opted out.
   */
  it('can opt out of SMS phone verification', () => {
    const userPhoneNumber = randomPhoneNumber();
    const userProfile = profileFactory.build({
      uid: randomNumber(1000, 9999),
      username: randomLabel(),
      phone_number: userPhoneNumber,
    });

    const expectedOptInMessage =
      'You have opted in to SMS messaging for phone verification';
    const expectedOptOutMessage =
      'You are opted out of SMS messaging for phone verification';

    mockGetProfile(userProfile).as('getProfile');
    mockSmsVerificationOptOut().as('smsOptOut');

    cy.visitWithLogin('/profile/auth');
    cy.wait('@getProfile');

    cy.findByText(expectedOptInMessage).should('be.visible');

    ui.button
      .findByTitle('Opt Out')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle('Opt out of SMS messaging for phone verification')
      .should('be.visible')
      .within(() => {
        cy.findByText(userPhoneNumber, { exact: false }).should('be.visible');

        ui.buttonGroup
          .findButtonByTitle('Opt Out')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@smsOptOut');
    cy.findByText(expectedOptOutMessage).should('be.visible');

    assertToast('Successfully opted out of SMS messaging');
  });
});
