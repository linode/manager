/**
 * @file Integration tests for account two-factor authentication functionality.
 */

import {
  mockConfirmTwoFactorAuth,
  mockDisableTwoFactorAuth,
  mockEnableTwoFactorAuth,
  mockGetProfile,
  mockGetSecurityQuestions,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import {
  randomHex,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';

import {
  profileFactory,
  securityQuestionsFactory,
} from 'src/factories/profile';

import type { SecurityQuestionsData } from '@linode/api-v4';

/**
 * Returns a Cypress chainable for the "Two-Factor Authentication".
 *
 * @returns Cypress chainable for 2fa page section.
 */
const getTwoFactorSection = (): Cypress.Chainable => {
  return cy.contains('h3', 'Two-Factor Authentication (2FA)').parent();
};

/**
 * Generates a random 2FA scratch code for mocking.
 *
 * @returns 2FA scratch code.
 */
const randomScratchCode = (): string => {
  const randomScratchCodeOptions = {
    lowercase: true,
    numbers: false,
    spaces: false,
    symbols: false,
    uppercase: false,
  };

  const segmentA = randomString(5, randomScratchCodeOptions);
  const segmentB = randomString(5, randomScratchCodeOptions);
  const segmentC = randomString(5, randomScratchCodeOptions);
  const segmentD = randomString(4, randomScratchCodeOptions);

  return `${segmentA}-${segmentB}-${segmentC}-${segmentD}`;
};

/**
 * Generates a random 2FA token for mocking.
 *
 * @returns 2FA token.
 */
const randomToken = (): string => {
  const randomTokenOptions = {
    lowercase: false,
    numbers: true,
    spaces: false,
    symbols: false,
    uppercase: false,
  };

  return randomString(6, randomTokenOptions);
};

/**
 * Returns unanswered security question data for mocking.
 *
 * @returns Unanswered security question data.
 */
const getUnansweredSecurityQuestions = (): SecurityQuestionsData => {
  return securityQuestionsFactory.build();
};

/**
 * Returns answered security question data for mocking.
 *
 * @returns Answered security question data.
 */
const getAnsweredSecurityQuestions = (): SecurityQuestionsData => {
  const securityQuestions = securityQuestionsFactory.build();

  // Pre-set answers for security questions.
  const securityQuestionAnswers = [
    randomString(10),
    randomString(10),
    randomString(10),
  ];

  securityQuestions.security_questions[0].response = securityQuestionAnswers[0];
  securityQuestions.security_questions[1].response = securityQuestionAnswers[1];
  securityQuestions.security_questions[2].response = securityQuestionAnswers[2];

  return securityQuestions;
};

// User profile with 2FA disabled.
const userProfile = profileFactory.build({
  two_factor_auth: false,
  uid: randomNumber(1000, 9999),
  username: randomLabel(),
  verified_phone_number: undefined,
});

// User profile with 2FA enabled.
const userProfileTwoFactorEnabled = {
  ...userProfile,
  two_factor_auth: true,
};

// Error that appears when an invalid token is submitted when enabling 2FA.
const invalidTokenError =
  'Invalid token. Two-factor auth not enabled. Please try again.';

// Message that appears when the user has enabled 2FA.
const enabledMessage = 'Two-factor authentication has been enabled.';

// Message that appears when the user has disabled 2FA.
const disabledMessage = 'Two-factor authentication has been disabled.';

// Warning message that appears when the user is resetting 2FA.
const resetWarningMessage =
  'Confirming a new key will invalidate codes generated from any previous key.';

// Warning message that appears when security questions are not answered.
const securityQuestionsMessage =
  'To use two-factor authentication you must set up your security questions listed below.';

describe('Two-factor authentication', () => {
  /*
   * - Validates 2FA enable flow using mocked data.
   * - Confirms UI flow when user enables 2FA and enters a valid token.
   * - Confirms UI flow when user enters an invalid token when enabling 2FA.
   * - Confirms that user is shown instructions to keep scratch code safe.
   */
  it('can enable two factor auth', () => {
    const invalidToken = randomToken();
    const validToken = randomToken();
    const mockedKey = randomHex(16);
    const mockedScratchCode = randomScratchCode();

    // Mock profile data to ensure that 2FA is disabled.
    mockGetProfile(userProfile).as('getProfile');
    mockGetSecurityQuestions(getAnsweredSecurityQuestions()).as(
      'getSecurityQuestions'
    );
    cy.visitWithLogin('/profile/auth');
    cy.wait('@getProfile');
    cy.wait('@getSecurityQuestions');

    getTwoFactorSection().within(() => {
      mockEnableTwoFactorAuth(mockedKey).as('enableTwoFactorAuth');

      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'false')
        .should('be.visible')
        .click();

      cy.wait('@enableTwoFactorAuth');
      cy.get('[data-qa-qr-code]').should('be.visible');

      cy.findByLabelText('Secret Key')
        .should('be.visible')
        .should('have.value', mockedKey);

      // Type an invalid token first, confirm that error message appears as expected.
      cy.findByLabelText('Token').should('be.visible').type(invalidToken);

      ui.button
        .findByTitle('Confirm Token')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.findByText(invalidTokenError).should('be.visible');

      // Type a valid token, confirm that 2fa is enabled and scratch code is shown.
      mockConfirmTwoFactorAuth(mockedScratchCode).as('confirmTwoFactorAuth');
      mockGetProfile(userProfileTwoFactorEnabled).as(
        'getProfileTwoFactorEnabled'
      );
      cy.findByLabelText('Token').should('be.visible').type(validToken);

      ui.button
        .findByTitle('Confirm Token')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@confirmTwoFactorAuth');
      cy.wait('@getProfileTwoFactorEnabled');
    });

    ui.dialog
      .findByTitle('Scratch Code')
      .should('be.visible')
      .within(() => {
        /*
         * Confirm that the user is instructed:
         *
         * - To write down their scratch code.
         * - That Cloud Manager will not show them their scratch code again.
         */
        const instructionNoteSecurely = 'make a note of it and keep it secure';
        const instructionOneTimeAccess = 'this is the only time it will appear';

        cy.findByText(instructionNoteSecurely, { exact: false }).should(
          'be.visible'
        );
        cy.findByText(instructionOneTimeAccess, { exact: false }).should(
          'be.visible'
        );

        // Confirm that scratch code is shown.
        cy.findByText(mockedScratchCode).should('be.visible');

        ui.buttonGroup
          .findButtonByTitle('Got it')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that two-factor authentication is now enabled.
    getTwoFactorSection().within(() => {
      cy.findByText(enabledMessage).should('be.visible');
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'true')
        .should('be.visible');
    });
  });

  /**
   * - Validates 2FA disable flow using mocked data.
   */
  it('can disable two factor auth', () => {
    mockGetProfile(userProfileTwoFactorEnabled).as('getProfile');
    mockGetSecurityQuestions(getAnsweredSecurityQuestions()).as(
      'getSecurityQuestions'
    );
    cy.visitWithLogin('/profile/auth');
    cy.wait('@getProfile');
    cy.wait('@getSecurityQuestions');

    mockDisableTwoFactorAuth().as('disableTwoFactorAuth');
    mockGetProfile(userProfile).as('getProfileTwoFactorDisabled');

    // Confirm that 2FA is already enabled.
    getTwoFactorSection().within(() => {
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'true')
        .should('be.visible')
        .click();
    });

    // Handle 2FA disable confirmation prompt.
    ui.dialog.findByTitle('Disable Two-Factor Authentication').within(() => {
      ui.buttonGroup
        .findButtonByTitle('Disable Two-factor Authentication')
        .click();
    });

    cy.wait('@disableTwoFactorAuth');
    cy.wait('@getProfileTwoFactorDisabled');

    // Confirm that 2FA is now disabled.
    getTwoFactorSection().within(() => {
      cy.findByText(disabledMessage).should('be.visible');
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'false')
        .should('be.visible');
    });
  });

  /**
   * - Validates 2FA reset flow using mocked data.
   * - Confirms that user is warned that resetting 2FA will invalidate 2FA codes.
   */
  it('can reset two factor auth', () => {
    const validToken = randomToken();
    const mockedScratchCode = randomScratchCode();

    mockGetProfile(userProfileTwoFactorEnabled).as('getProfile');
    mockGetSecurityQuestions(getAnsweredSecurityQuestions()).as(
      'getSecurityQuestions'
    );
    cy.visitWithLogin('/profile/auth');
    cy.wait('@getProfile');
    cy.wait('@getSecurityQuestions');

    getTwoFactorSection().within(() => {
      mockEnableTwoFactorAuth(randomHex(16)).as('resetTwoFactorAuth');

      // Confirm that reset link is present, click on it.
      cy.findByText('Reset two-factor authentication')
        .should('be.visible')
        .click();

      cy.wait('@resetTwoFactorAuth');
      cy.findByText(resetWarningMessage);

      // Type a valid token, confirm that 2fa is enabled and scratch code is shown.
      mockConfirmTwoFactorAuth(mockedScratchCode).as(
        'confirmResetTwoFactorAuth'
      );
      mockGetProfile(userProfileTwoFactorEnabled).as(
        'getProfileTwoFactorEnabled'
      );
      cy.findByLabelText('Token').should('be.visible').type(validToken);

      ui.button
        .findByTitle('Confirm Token')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.wait('@confirmResetTwoFactorAuth');
    cy.wait('@getProfileTwoFactorEnabled');

    // Confirm that scratch code is shown, close dialog.
    ui.dialog
      .findByTitle('Scratch Code')
      .should('be.visible')
      .within(() => {
        cy.findByText(mockedScratchCode).should('be.visible');

        ui.buttonGroup
          .findButtonByTitle('Got it')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that two-factor authentication is reset.
    getTwoFactorSection().within(() => {
      // The 2FA enable message appears after reset, not a reset-specific message.
      cy.findByText(enabledMessage).should('be.visible');
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'true')
        .should('be.visible');
    });
  });

  /**
   * - Confirms that user cannot enable 2FA when security questions are unanswered.
   * - Confirms that warning message is shown explaining why 2FA cannot be enabled.
   */
  it('cannot enable two factor auth without security questions', () => {
    mockGetProfile(userProfile).as('getProfile');
    mockGetSecurityQuestions(getUnansweredSecurityQuestions()).as(
      'getSecurityQuestions'
    );
    cy.visitWithLogin('/profile/auth');
    cy.wait('@getProfile');
    cy.wait('@getSecurityQuestions');

    getTwoFactorSection().within(() => {
      cy.findByText(securityQuestionsMessage).should('be.visible');

      // Confirm that the usual 2FA enable/disable/reset controls are not present.
      cy.contains('Enabled').should('not.exist');
      cy.contains('Disabled').should('not.exist');
      cy.contains('Reset two-factor authentication').should('not.exist');
    });
  });
});
