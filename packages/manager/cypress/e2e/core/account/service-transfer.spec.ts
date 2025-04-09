/**
 * @file Tests for service transfer functionality between accounts.
 */

import { getProfile } from '@linode/api-v4/lib/profile';
import { createLinodeRequestFactory, linodeFactory } from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
import { visitUrlWithManagedEnabled } from 'support/api/managed';
import {
  interceptInitiateEntityTransfer,
  mockAcceptEntityTransfer,
  mockGetEntityTransfers,
  mockGetEntityTransfersError,
  mockInitiateEntityTransferError,
  mockReceiveEntityTransfer,
} from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { pollLinodeStatus } from 'support/util/polling';
import { randomLabel, randomUuid } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { entityTransferFactory } from 'src/factories/entityTransfers';
import { formatDate } from 'src/utilities/formatDate';

import type {
  EntityTransfer,
  EntityTransferStatus,
  Linode,
  Profile,
} from '@linode/api-v4';

// Service transfer empty state message.
const serviceTransferEmptyState = 'No data to display.';

// Service transfer error message.
export const serviceTransferErrorMessage = 'An unknown error has occurred';

// Service transfer landing page URL.
const serviceTransferLandingUrl = '/account/service-transfers';

// Service transfer initiation page URL.
const serviceTransferCreateUrl = '/account/service-transfers/create';

// Possible status responses for service transfers.
const serviceTransferStatuses: EntityTransferStatus[] = [
  'pending',
  'completed',
  'failed',
  'accepted',
  'stale',
  'canceled',
];

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
  cy.findByLabelText('Receive a Service Transfer').should('be.visible').click();
  cy.focused().type(token);

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
  before(() => {
    /*
     * Clean up Linodes and LKE Clusters so that they do not interfere when
     * selecting Linodes from the list during service transfer initiation.
     */
    cleanUp(['service-transfers', 'linodes', 'lke-clusters']);
  });

  /*
   * - Confirms user can navigate to service transfer page via user menu.
   */
  it('can navigate to service transfers landing page', () => {
    cy.tag('method:e2e');
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
   * - Confirms the Service Transfers empty state when no service transfers exist on the account.
   */
  it('can display empty state when no service transfer exists', () => {
    // Mock empty array for all three service transfers.
    const pendingTransfers: EntityTransfer[] = [];
    const receivedTransfers: EntityTransfer[] = [];
    const sentTransfers: EntityTransfer[] = [];

    mockGetEntityTransfers(
      pendingTransfers,
      receivedTransfers,
      sentTransfers
    ).as('getTransfers');

    cy.visitWithLogin(serviceTransferLandingUrl);

    // Wait for 3 requests to transfers endpoint -- each section loads transfers separately.
    cy.wait(['@getTransfers', '@getTransfers', '@getTransfers']);

    // Confirm that the "Pending Service Transfers" panel does not exist.
    cy.get('[data-qa-panel="Pending Service Transfers"]').should('not.exist');

    // Confirm that text "No data to display" is in "Received Service Transfers" panel.
    cy.findByText('Received Service Transfers').should('be.visible').click();

    cy.get('[data-qa-panel="Received Service Transfers"]').within(() => {
      cy.findByText(serviceTransferEmptyState, { exact: false }).should(
        'be.visible'
      );
    });

    // Confirm that text "No data to display" is in "Sent Service Transfers" panel.
    cy.findByText('Sent Service Transfers').should('be.visible').click();

    cy.get('[data-qa-panel="Sent Service Transfers"]')
      .should('be.visible')
      .within(() => {
        cy.findByText(serviceTransferEmptyState, { exact: false }).should(
          'be.visible'
        );
      });
  });

  /*
   * - Confirms that pending, received, and sent transfers are shown on landing page.
   */
  it('lists service transfers on landing page', () => {
    const pendingTransfers = entityTransferFactory.buildList(3, {
      entities: {
        linodes: [0, 1, 2, 3, 4],
      },
      status: 'pending',
    });

    const receivedTransfers = entityTransferFactory.buildList(4, {
      entities: {
        linodes: [0],
      },
      is_sender: false,
    });

    const sentTransfers = serviceTransferStatuses.map((status) => {
      return entityTransferFactory.build({
        entities: {
          linodes: [0, 1],
        },
        is_sender: true,
        status,
      });
    });

    mockGetEntityTransfers(
      pendingTransfers,
      receivedTransfers,
      sentTransfers
    ).as('getTransfers');

    cy.visitWithLogin(serviceTransferLandingUrl);

    // Wait for 3 requests to transfers endpoint -- each section loads transfers separately.
    cy.wait(['@getTransfers', '@getTransfers', '@getTransfers']);

    // Confirm that pending transfers are displayed in "Pending Service Transfers" panel.
    cy.defer(() => getProfile(), 'getting profile').then((profile: Profile) => {
      const dateFormatOptions = { timezone: profile.timezone };
      cy.get('[data-qa-panel="Pending Service Transfers"]')
        .should('be.visible')
        .within(() => {
          pendingTransfers.forEach((pendingTransfer: EntityTransfer) => {
            cy.findByText(pendingTransfer.token)
              .should('be.visible')
              .closest('tr')
              .within(() => {
                cy.findByText('5 Linodes').should('be.visible');
                cy.findByText(
                  formatDate(pendingTransfer.created, dateFormatOptions)
                ).should('be.visible');
                cy.findByText(
                  formatDate(pendingTransfer.expiry, dateFormatOptions)
                ).should('be.visible');
              });
          });
        });

      cy.get('[data-qa-panel="Received Service Transfers"]')
        .should('be.visible')
        .within(() => {
          receivedTransfers.forEach((receivedTransfer: EntityTransfer) => {
            cy.findByText(receivedTransfer.token)
              .should('be.visible')
              .closest('tr')
              .within(() => {
                cy.findByText('1 Linode').should('be.visible');
                cy.findByText(
                  formatDate(receivedTransfer.created, dateFormatOptions)
                ).should('be.visible');
              });
          });
        });

      cy.get('[data-qa-panel="Sent Service Transfers"]')
        .should('be.visible')
        .within(() => {
          sentTransfers.forEach((sentTransfer: EntityTransfer) => {
            cy.findByText(sentTransfer.token)
              .should('be.visible')
              .closest('tr')
              .within(() => {
                cy.findByText('2 Linodes').should('be.visible');
                cy.findByText(sentTransfer.token).should('be.visible');
                cy.findByText(
                  formatDate(sentTransfer.created, dateFormatOptions)
                ).should('be.visible');
                cy.findByText(sentTransfer.status, { exact: false }).should(
                  'be.visible'
                );
              });
          });
        });
    });
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
  it('can initiate and cancel a service transfer', () => {
    cy.tag('method:e2e');
    // Create a Linode to transfer.
    const setupLinode = async (): Promise<Linode> => {
      const payload = createLinodeRequestFactory.build({
        label: randomLabel(),
        region: chooseRegion().id,
      });

      const linode: Linode = await createTestLinode(payload, {
        securityMethod: 'powered_off',
      });

      await pollLinodeStatus(linode.id, 'offline', {
        initialDelay: 15000,
      });

      return linode;
    };

    cy.defer(() => setupLinode(), 'creating and booting Linode').then(
      (linode: Linode) => {
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
              // and that they are informed that the transfer may take up to an hour.
              cy.findByText('secure delivery method', { exact: false }).should(
                'be.visible'
              );
              cy.findByText('may take up to an hour', { exact: false }).should(
                'be.visible'
              );

              cy.findByDisplayValue(token).should('be.visible');

              // Close dialog.
              cy.findByLabelText('Close').should('be.visible').click();
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

          // Attempt to receive an invalid token.
          redeemToken(randomUuid());
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

          ui.toast.assertMessage('Service transfer canceled successfully.');
        });
      }
    );
  });

  /*
   * - Confirms UI flow when accepting an entity transfer using mocked API data.
   * - Confirms that entity transfer is listed under "Received Service Transfers" after accepting.
   */
  it('can receive a service transfer', () => {
    const token = randomUuid();
    const transfer = entityTransferFactory.build({
      entities: {
        linodes: [0],
      },
      is_sender: false,
      status: 'pending',
      token,
    });

    mockGetEntityTransfers([], [], []).as('getTransfers');
    mockReceiveEntityTransfer(token, transfer).as('receiveEntityTransfer');
    mockAcceptEntityTransfer(token).as('acceptEntityTransfer');

    cy.visitWithLogin(serviceTransferLandingUrl);
    cy.wait(['@getTransfers', '@getTransfers', '@getTransfers']);

    cy.get('[data-qa-panel="Pending Service Transfers"]').should('not.exist');

    redeemToken(token);
    cy.wait('@receiveEntityTransfer');

    mockGetEntityTransfers([], [transfer], []).as('getTransfers');
    ui.dialog
      .findByTitle('Receive a Service Transfer')
      .should('be.visible')
      .within(() => {
        cy.findByText('1 Linode').should('be.visible');

        // Confirm that dialog button is disabled before clicking checkbox.
        ui.buttonGroup
          .findButtonByTitle('Accept Transfer')
          .should('be.visible')
          .should('be.disabled');

        cy.findByText(
          'I accept responsibility for the billing of services listed above.'
        )
          .should('be.visible')
          .closest('label')
          .click();

        ui.buttonGroup
          .findButtonByTitle('Accept Transfer')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@acceptEntityTransfer', '@getTransfers']);
    ui.toast.assertMessage('Transfer accepted successfully.');
    cy.get('[data-qa-panel="Received Service Transfers"]')
      .should('be.visible')
      .click();
    cy.findByText(token).should('be.visible');
  });

  /*
   * - Confirms that the managed users are not able to initiate service transfers.
   */
  it('can not initiate a service transfer by managed users', () => {
    // Mock Linodes to initiate a service transfer.
    const mockLinodes = new Array(5)
      .fill(null)
      .map((item: null, index: number): Linode => {
        return linodeFactory.build({
          label: `Linode ${index}`,
          region: chooseRegion().id,
        });
      });

    mockGetLinodes(mockLinodes).as('getLinodes');
    const errorMessage = 'You cannot initiate transfers with Managed enabled.';
    mockInitiateEntityTransferError(errorMessage);

    // Navigate to Service Transfer landing page, initiate transfer.
    visitUrlWithManagedEnabled(serviceTransferLandingUrl);
    ui.button
      .findByTitle('Make a Service Transfer')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@getLinodes');

    cy.findByText('Make a Service Transfer').should('be.visible');
    cy.url().should('endWith', serviceTransferCreateUrl);
    initiateLinodeTransfer(mockLinodes[0].label);
    cy.findByText(errorMessage).should('be.visible');
  });

  /*
   * - Confirms that an error message is displayed in both the Received and Sent tables when the requests to fetch service transfers fail.
   */
  it('should display an error message when the request fails to fetch service transfer', () => {
    mockGetEntityTransfersError().as('getTransfersError');

    cy.visitWithLogin(serviceTransferLandingUrl);
    cy.wait('@getTransfersError');

    cy.get('[data-qa-panel="Pending Service Transfers"]').should('not.exist');

    // Confirm that an error message is displayed in both "Received Service Transfers" and "Sent Service Transfers" panels.
    ['Received Service Transfers', 'Sent Service Transfers'].forEach(
      (transfer) => {
        cy.get(`[data-qa-panel="${transfer}"]`)
          .should('be.visible')
          .within(() => {
            cy.get(`[data-qa-panel-summary="${transfer}"]`).click();
            // Error Icon should shows up.
            cy.findByTestId('ErrorOutlineIcon').should('be.visible');
            // Error message should be visible.
            cy.findByText(serviceTransferErrorMessage, { exact: false }).should(
              'be.visible'
            );
          });
      }
    );
  });
});
