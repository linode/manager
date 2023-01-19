/**
 * @file Tests for service transfer functionality between accounts.
 */

import { createLinode } from '@linode/api-v4/lib/linodes';
import { Linode } from '@linode/api-v4/types';
import { authenticate } from 'support/api/authentication';
import { regions } from 'support/constants/regions';
import { interceptInitiateEntityTransfer } from 'support/intercepts/account';
import { ui } from 'support/ui';
import { pollLinodeStatus } from 'support/util/polling';
import { randomLabel, randomItem, randomString } from 'support/util/random';
import { createLinodeRequestFactory } from 'src/factories/linodes';

// Service transfer landing page URL.
const serviceTransferLandingUrl = '/account/service-transfers';

// Service transfer initiation page URL.
const serviceTransferCreateUrl = '/account/service-transfers/create';

/**
 * Initiates a service transfer for the Linode with the given label.
 *
 * This assumes that the user has already navigated to the service transfer
 * creation page.
 *
 * @param linodeLabel - Label for Linode for which to initiate transfer.
 */
const initiateLinodeTransfer = (linodeLabel: string) => {
  cy.findByText(linodeLabel)
    .should('be.visible')
    .closest('tr')
    .within(() => {
      cy.get('[data-qa-checked]').should('be.visible').click();
    });

  cy.findByText('1 Linode to be transferred').should('be.visible');

  ui.button
    .findByTitle('Generate Token')
    .should('be.visible')
    .should('be.enabled')
    .click();
};

/**
 * Attempts to redeem the given token.
 *
 * This assumes the user has navigated to the Service Transfer landing page.
 *
 * @param token - Token to attempt to redeem.
 */
const redeemToken = (token: string) => {
  cy.findByLabelText('Receive a Service Transfer')
    .should('be.visible')
    .click()
    .type(token);

  ui.button
    .findByTitle('Review Details')
    .should('be.visible')
    .should('be.enabled')
    .click();
};

/**
 * Asserts that an error message is shown upon transfer token redemption attempt.
 *
 * @param errorMessage - Error message which is expected to be shown.
 */
const assertReceiptError = (errorMessage: string) => {
  ui.dialog
    .findByTitle('Receive a Service Transfer')
    .should('be.visible')
    .within(() => {
      cy.findByText(errorMessage).should('be.visible');
      ui.buttonGroup
        .findButtonByTitle('Cancel')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
};

authenticate();
describe('Account service transfers', () => {
  /*
   * - Confirms user can navigate to service transfer page via user menu.
   */
  it('can navigate to service transfers page', () => {
    cy.visitWithLogin('/');
    cy.findByLabelText('Profile & Account').should('be.visible').click();

    cy.get('[data-qa-user-menu]')
      .should('be.visible')
      .within(() => {
        cy.findByText('Service Transfers').should('be.visible').click();
      });

    cy.findByText('Received Service Transfers').should('be.visible');
    cy.findByText('Sent Service Transfers').should('be.visible');
    cy.url().should('endWith', serviceTransferLandingUrl);
  });

  /*
   * - Confirms that users can initiate a transfer of 1 Linode by generating a transfer token
   * - Confirms that users are shown the generated token
   * - Confirms that pending transfers are listed in the landing page table
   * - Confirms that users cannot receive a transfer using an invalid token
   * - Confirms that users cannot receive a transfer using a token they generated themselves
   * - Confirms that users cannot generate a new token for a Linode with a pending transfer
   * - Confirms that users can cancel a service transfer
   */
  it('can initiate and cancel a linode transfer', () => {
    // Create a Linode to transfer and wait for it to boot.
    const setupLinode = async (): Promise<Linode> => {
      const payload = createLinodeRequestFactory.build({
        label: randomLabel(),
        region: randomItem(regions),
      });

      const linode: Linode = await createLinode(payload);
      await pollLinodeStatus(linode.id, 'running', {
        initialDelay: 15000,
      });

      return linode;
    };

    cy.defer(setupLinode()).then((linode: Linode) => {
      interceptInitiateEntityTransfer().as('initiateTransfer');

      // Navigate to Service Transfer landing page, initiate transfer.
      cy.visitWithLogin(serviceTransferLandingUrl);
      ui.button
        .findByTitle('Make a Service Transfer')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.findByText('Make a Service Transfer').should('be.visible');
      cy.url().should('endWith', serviceTransferCreateUrl);
      initiateLinodeTransfer(linode.label);

      cy.wait('@initiateTransfer').then((response) => {
        const token = response?.response?.body.token;
        if (!token) {
          throw new Error(
            'Failed to retrieve generated transfer token from API response.'
          );
        }

        ui.dialog
          .findByTitle('Service Transfer Token')
          .should('be.visible')
          .within(() => {
            // Confirm that user is advised to transfer token using a secure means,
            // and that they are informed that transfer may take up to an hour.
            cy.findByText('secure delivery method', { exact: false }).should(
              'be.visible'
            );
            cy.findByText('may take up to an hour', { exact: false }).should(
              'be.visible'
            );

            cy.findByDisplayValue(token).should('be.visible');

            // Close dialog.
            cy.findByLabelText('Close drawer').should('be.visible').click();
          });

        // Confirm token is listed on landing page and that correct information
        // is shown in modal when token is clicked.
        cy.findByText(token)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText(token).should('be.visible').click();
          });

        ui.dialog
          .findByTitle('Service Transfer Details')
          .should('be.visible')
          .within(() => {
            cy.findByText(token).should('be.visible');
            cy.findByText(linode.id).should('be.visible');
            cy.get('[data-qa-close-drawer]').should('be.visible').click();
          });

        // Attempt to receive the an invalid token.
        redeemToken(randomString());
        assertReceiptError('Not found');

        // Attempt to receive previously generated token.
        redeemToken(token);
        assertReceiptError(
          'You cannot initiate a transfer to another user on your account.'
        );

        // Attempt to generate a new token for the same Linode.
        ui.button
          .findByTitle('Make a Service Transfer')
          .should('be.visible')
          .should('be.enabled')
          .click();

        initiateLinodeTransfer(linode.label);
        const errorMessage = `Cannot transfer Linode(s) with ID(s) ${linode.id}: Already pending another transfer request.`;
        cy.findByText(errorMessage).should('be.visible');

        // Navigate back to landing page and cancel transfer.
        cy.contains('a', 'Service Transfers').should('be.visible').click();
        cy.url().should('endWith', serviceTransferLandingUrl);

        cy.findByText(token)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            ui.button
              .findByTitle('Cancel')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        ui.dialog
          .findByTitle('Cancel this Service Transfer?')
          .should('be.visible')
          .within(() => {
            ui.buttonGroup
              .findButtonByTitle('Cancel Service Transfer')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that service transfer is removed from pending list.
        cy.contains('token').should('not.exist');
      });
    });
  });
});
