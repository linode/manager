/**
 * @file Integration tests for SMS phone verification.
 */

import { profileFactory } from 'src/factories/profile';
import { randomLabel, randomNumber } from 'support/util/random';
import {
  mockGetProfile,
  mockSendVerificationCode,
  mockVerifyVerificationCode,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { assertToast } from 'support/ui/events';

describe('SMS phone verification', () => {
  /*
   * - Vaildates SMS phone verification opt-in flow using mocked data.
   * - Confirms that user is shown phone verification prompt.
   * - Confirms that user can request OTP to opt into SMS verification.
   * - Confirms UI flow when user enters incorrect OTP.
   * - Confirms UI flow when user clicks "Resend Verification Code".
   * - Confirms UI flow when user enters correct OTP.
   */
  it('can opt into SMS phone verification', () => {
    const optInPhoneNumber = `1115551155`;
    const userProfile = profileFactory.build({
      uid: randomNumber(1000, 9999),
      username: randomLabel(),
      verified_phone_number: undefined,
    });

    const verificationNotice =
      'By clicking Send Verification Code you are opting in to receive SMS messages reguarding account verification.';
    // @TODO Update this to reflect actual API error message.
    const verificationCodeError = 'Invalid verification code.';
    const confirmationMessage =
      'SMS verification code was sent to +1 1115551155';

    mockGetProfile(userProfile).as('getProfile');
    mockSendVerificationCode().as('sendVerificationCode');
    mockVerifyVerificationCode(verificationCodeError).as('verifyCode');

    cy.visitWithLogin('/profile/auth');
    cy.wait('@getProfile');

    cy.findByText(verificationNotice, { exact: false }).should('be.visible');

    // @TODO Add steps to change country code before typing phone number.

    cy.findByLabelText('Phone Number').click().type(optInPhoneNumber);

    ui.button
      .findByTitle('Send Verification Code')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@sendVerificationCode');
    cy.findByText(confirmationMessage, { exact: false }).should('be.visible');

    // Mock invalid verification code for first attempt.
    cy.findByLabelText('Verification Code')
      .should('be.visible')
      .click()
      .type(`${randomNumber(10000, 50000)}`);

    ui.button
      .findByTitle('Verify Phone Number')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@verifyCode');
    cy.findByText(verificationCodeError);

    // Resend verification code.
    cy.findByText('Resend verification code').should('be.visible').click();

    cy.wait('@sendVerificationCode');
    assertToast('Successfully resent verification code');

    // Mock successful verification code for second attempt.
    mockVerifyVerificationCode().as('verifyCode');
    cy.findByLabelText('Verification Code')
      .should('be.visible')
      .click()
      .clear()
      .type(`${randomNumber(10000, 50000)}`);

    ui.button
      .findByTitle('Verify Phone Number')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@verifyCode');

    assertToast('Successfully verified phone number');

    cy.findByText('+1 1115551155').should('be.visible');

    ui.button
      .findByTitle('Send Verification Code')
      .should('be.visible')
      .should('be.disabled');
  });
});
