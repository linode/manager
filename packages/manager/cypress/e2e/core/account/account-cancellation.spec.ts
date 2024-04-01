/**
 * @file Integration tests for Cloud Manager account cancellation flows.
 */

import { profileFactory } from 'src/factories/profile';
import { accountFactory } from 'src/factories/account';
import {
  mockGetAccount,
  mockCancelAccount,
  mockCancelAccountError,
} from 'support/intercepts/account';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import {
  randomDomainName,
  randomPhrase,
  randomString,
} from 'support/util/random';
import type { CancelAccount } from '@linode/api-v4';
import { mockWebpageUrl } from 'support/intercepts/general';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';

// Data loss warning which is displayed in the account cancellation dialog.
const cancellationDataLossWarning =
  'Please note this is an extremely destructive action. Closing your account \
means that all services Linodes, Volumes, DNS Records, etc will be lost and \
may not be able be restored.';

// Error message that appears when a payment failure occurs upon cancellation attempt.
const cancellationPaymentErrorMessage =
  'We were unable to charge your credit card for services rendered. \
We cannot cancel this account until the balance has been paid.';

// Tooltip message that appears when a child account tries to close the account.
const contactParentUserTooltipsMessage =
  'Contact your parent user to close your account.';

// Tooltip message that appears when a child account tries to close the account.
const contactCustomerSupportTooltipsMessage =
  'Contact customer support to close this account.';

// Tooltip message that appears when a parent account with one and more child accounts tries to close the account.
const removeChildAccountTooltipsMessage =
  'Remove child accounts before closing the account.';

describe('Account cancellation', () => {
  /*
   * - Confirms that a user can cancel their account from the Account Settings page.
   * - Confirms that user is warned that account cancellation is destructive.
   * - Confirms that Cloud Manager displays a notice when an error occurs during cancellation.
   * - Confirms that Cloud Manager includes user comments in cancellation request payload.
   * - Confirms that Cloud Manager shows a survey CTA which directs the user to the expected URL.
   */
  it('users can cancel account', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'mock-user',
      restricted: false,
    });
    const mockCancellationResponse: CancelAccount = {
      survey_link: `https://${randomDomainName()}/${randomString(5)}`,
    };

    const cancellationComments = randomPhrase();

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');
    mockCancelAccountError(cancellationPaymentErrorMessage, 409).as(
      'cancelAccount'
    );
    mockWebpageUrl(
      mockCancellationResponse.survey_link,
      'This is a mock webpage to confirm Cloud Manager survey link behavior'
    ).as('getSurveyPage');

    // Navigate to Account Settings page, click "Close Account" button.
    cy.visitWithLogin('/account/settings');
    cy.wait(['@getAccount', '@getProfile']);

    ui.accordion
      .findByTitle('Close Account')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    ui.dialog
      .findByTitle('Are you sure you want to close your Linode account?')
      .should('be.visible')
      .within(() => {
        cy.findByText(cancellationDataLossWarning, { exact: false }).should(
          'be.visible'
        );

        // Confirm that submit button is disabled before entering required info.
        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.disabled');

        // Enter username, confirm that submit button becomes enabled, and click
        // the submit button.
        cy.findByLabelText(
          `Please enter your Username (${mockProfile.username}) to confirm.`
        )
          .should('be.visible')
          .should('be.enabled')
          .type(mockProfile.username);

        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm that request payload contains expected data and API error
        // message is displayed in the dialog.
        cy.wait('@cancelAccount').then((intercept) => {
          expect(intercept.request.body['comments']).to.equal('');
        });

        cy.findByText(cancellationPaymentErrorMessage).should('be.visible');

        // Enter account cancellation comments, click "Close Account" again,
        // and this time mock a successful account cancellation response.
        mockCancelAccount(mockCancellationResponse).as('cancelAccount');
        cy.contains('Comments (optional)').click().type(cancellationComments);

        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@cancelAccount').then((intercept) => {
          expect(intercept.request.body['comments']).to.equal(
            cancellationComments
          );
        });
      });

    // Confirm that Cloud presents account cancellation screen and prompts the
    // user to complete the exit survey. Confirm that clicking survey button
    // directs the user to the expected URL.
    cy.findByText('It’s been our pleasure to serve you.').should('be.visible');
    ui.button
      .findByTitle('Take our exit survey')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@getSurveyPage');
    cy.url().should('equal', mockCancellationResponse.survey_link);
  });

  /*
   * - Confirms Cloud Manager behavior when a restricted user attempts to close an account.
   * - Confirms that API error response message is displayed in cancellation dialog.
   */
  it('restricted users cannot cancel account', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'mock-restricted-user',
      restricted: true,
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');
    mockCancelAccountError('Unauthorized', 403).as('cancelAccount');

    // Navigate to Account Settings page, click "Close Account" button.
    cy.visitWithLogin('/account/settings');
    cy.wait(['@getAccount', '@getProfile']);

    ui.accordion
      .findByTitle('Close Account')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Fill out cancellation dialog and attempt submission.
    ui.dialog
      .findByTitle('Are you sure you want to close your Linode account?')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText(
          `Please enter your Username (${mockProfile.username}) to confirm.`
        )
          .should('be.visible')
          .should('be.enabled')
          .type(mockProfile.username);

        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm that API unauthorized error message is displayed.
        cy.wait('@cancelAccount');
        cy.findByText('Unauthorized').should('be.visible');
      });
  });
});

describe('Parent/Child account cancellation', () => {
  /*
   * - Confirms that a child user cannot close the account.
   */
  it('disables the "Close Account" button for a child user', () => {
    const mockAccount = accountFactory.build({});
    const mockProfile = profileFactory.build({
      username: 'mock-child-user',
      restricted: false,
      user_type: 'child',
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');

    // Navigate to Account Settings page, click "Close Account" button.
    cy.visitWithLogin('/account/settings');
    cy.wait(['@getAccount', '@getProfile']);

    ui.accordion
      .findByTitle('Close Account')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.disabled')
          .trigger('mouseover');
        // Click the button first, then confirm the tooltip is shown.
        ui.tooltip
          .findByText(contactParentUserTooltipsMessage)
          .should('be.visible');
      });
  });

  /**
   * Confirms that a proxy account cannot close the account
   */
  it('disables a proxy account to close the account', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'proxy-user',
      restricted: false,
      user_type: 'proxy',
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');

    // Navigate to Account Settings page, click "Close Account" button.
    cy.visitWithLogin('/account/settings');
    cy.wait(['@getAccount', '@getProfile']);

    ui.accordion
      .findByTitle('Close Account')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.disabled')
          .trigger('mouseover');
        // Click the button first, then confirm the tooltip is shown.
        ui.tooltip
          .findByText(contactCustomerSupportTooltipsMessage)
          .should('be.visible');
      });
  });

  /**
   * Confirms that a parent account with one or more active child accounts cannot close the account
   */
  it('disables a parent account with one or more active child accounts to close the account', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'parent-user',
      restricted: false,
      user_type: 'parent',
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');

    // Navigate to Account Settings page, click "Close Account" button.
    cy.visitWithLogin('/account/settings');
    cy.wait(['@getAccount', '@getProfile']);

    ui.accordion
      .findByTitle('Close Account')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.disabled')
          .trigger('mouseover');
        // Click the button first, then confirm the tooltip is shown.
        ui.tooltip
          .findByText(removeChildAccountTooltipsMessage)
          .should('be.visible');
      });
  });

  /**
   * Confirms that a parent account with no active child accounts can close the account
   */
  it('allows a default account with no active child accounts to close the account', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'default-user',
      restricted: true,
      user_type: 'default',
    });
    const mockCancellationResponse: CancelAccount = {
      survey_link: `https://${randomDomainName()}/${randomString(5)}`,
    };

    const cancellationComments = randomPhrase();

    // TODO: Parent/Child - M3-7559 clean up when feature is live in prod and feature flag is removed.
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');
    mockCancelAccountError(cancellationPaymentErrorMessage, 409).as(
      'cancelAccount'
    );
    mockWebpageUrl(
      mockCancellationResponse.survey_link,
      'This is a mock webpage to confirm Cloud Manager survey link behavior'
    ).as('getSurveyPage');

    // Navigate to Account Settings page, click "Close Account" button.
    cy.visitWithLogin('/account/settings');
    cy.wait(['@getAccount', '@getProfile']);

    ui.accordion
      .findByTitle('Close Account')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    ui.dialog
      .findByTitle('Are you sure you want to close your Linode account?')
      .should('be.visible')
      .within(() => {
        cy.findByText(cancellationDataLossWarning, { exact: false }).should(
          'be.visible'
        );

        // Confirm that submit button is disabled before entering required info.
        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.disabled');

        // Enter username, confirm that submit button becomes enabled, and click
        // the submit button.
        cy.findByLabelText(
          `Please enter your Username (${mockProfile.username}) to confirm.`
        )
          .should('be.visible')
          .should('be.enabled')
          .type(mockProfile.username);

        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm that request payload contains expected data and API error
        // message is displayed in the dialog.
        cy.wait('@cancelAccount').then((intercept) => {
          expect(intercept.request.body['comments']).to.equal('');
        });

        cy.findByText(cancellationPaymentErrorMessage).should('be.visible');

        // Enter account cancellation comments, click "Close Account" again,
        // and this time mock a successful account cancellation response.
        mockCancelAccount(mockCancellationResponse).as('cancelAccount');
        cy.contains('Comments (optional)').click().type(cancellationComments);

        ui.button
          .findByTitle('Close Account')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@cancelAccount').then((intercept) => {
          expect(intercept.request.body['comments']).to.equal(
            cancellationComments
          );
        });
      });

    // Confirm that Cloud presents account cancellation screen and prompts the
    // user to complete the exit survey. Confirm that clicking survey button
    // directs the user to the expected URL.
    cy.findByText('It’s been our pleasure to serve you.').should('be.visible');
    ui.button
      .findByTitle('Take our exit survey')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@getSurveyPage');
    cy.url().should('equal', mockCancellationResponse.survey_link);
  });
});
