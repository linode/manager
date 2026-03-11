import { authenticationType } from '@linode/api-v4';
import {
  interceptDeleteDestination,
  mockDeleteDestination,
  mockGetDestination,
  mockGetDestinations,
} from 'support/intercepts/delivery';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

import {
  akamaiObjectStorageDestinationFactory,
  customHttpsDestinationFactory,
} from 'src/factories';

import type { Destination } from '@linode/api-v4';

function checkActionMenu(tableAlias: string, mockDestinations: Destination[]) {
  mockDestinations.forEach((destination) => {
    cy.get(tableAlias)
      .find('tbody tr')
      .should('contain', destination.label)
      .then(() => {
        // If the row contains the label, proceed with clicking the action menu
        ui.actionMenu
          .findByTitle(`Action menu for Destination ${destination.label}`)
          .should('be.visible')
          .click();

        // Check that all items are enabled
        ui.actionMenuItem
          .findByTitle('Edit')
          .should('be.visible')
          .should('be.enabled');

        ui.actionMenuItem
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled');
      });

    // Close the action menu by clicking on Delivery Title of the screen
    cy.get('body').click(0, 0);
  });
}

function deleteDestinationViaActionMenu(
  tableAlias: string,
  destination: Destination
) {
  cy.get(tableAlias)
    .find('tbody tr')
    .should('contain', destination.label)
    .then(() => {
      // If the row contains the label, proceed with clicking the action menu
      ui.actionMenu
        .findByTitle(`Action menu for Destination ${destination.label}`)
        .should('be.visible')
        .click();

      mockDeleteDestination(404); // @TODO remove after API release on prod
      interceptDeleteDestination().as('deleteDestination');

      // Delete destination
      ui.actionMenuItem.findByTitle('Delete').click();

      // Find confirmation modal
      cy.findByText(`Are you sure you want to delete "${destination.label}"?`);
      ui.button.findByTitle('Delete').click();

      cy.wait('@deleteDestination');

      // Close confirmation modal after failure
      ui.button.findByTitle('Cancel').click();
    });
}

function editDestinationViaActionMenu(
  tableAlias: string,
  destination: Destination
) {
  cy.get(tableAlias)
    .find('tbody tr')
    .should('contain', destination.label)
    .then(() => {
      // If the row contains the label, proceed with clicking the action menu
      ui.actionMenu
        .findByTitle(`Action menu for Destination ${destination.label}`)
        .should('be.visible')
        .click();

      mockGetDestination(destination);
      // Edit destination redirect
      ui.actionMenuItem.findByTitle('Edit').click();
      cy.url().should('endWith', `/destinations/${destination.id}/summary`);
    });
}

const mockAkamaiObjectStorageDestinations: Destination[] = new Array(3)
  .fill(null)
  .map((_item: null, index: number): Destination => {
    return akamaiObjectStorageDestinationFactory.build({
      label: `Destination ${index}`,
    });
  });

const mockCustomHttpsDestinations: Destination[] = [
  customHttpsDestinationFactory.build({
    details: {
      authentication: { type: authenticationType.None },
      data_compression: 'gzip',
      endpoint_url: 'https://endpoint-1.example.com',
    },
  }),
  customHttpsDestinationFactory.build({
    details: {
      authentication: {
        type: authenticationType.Basic,
        details: { basic_authentication_user: 'user1' },
      },
      data_compression: 'gzip',
      endpoint_url: 'https://endpoint-2.example.com',
    },
  }),
];

const mockDestinations: Destination[] = [
  ...mockAkamaiObjectStorageDestinations,
  ...mockCustomHttpsDestinations,
];

describe('destinations landing checks for non-empty state', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpLogs: {
        enabled: true,
        beta: true,
        customHttpsEnabled: true,
        bypassAccountCapabilities: true,
      },
    });

    // Mock setup to display the Destinations landing page in a non-empty state
    mockGetDestinations(mockDestinations).as('getDestinations');
  });

  it('checks create destination button is enabled and user can see existing destinations', () => {
    // Login and wait for application to load
    cy.visitWithLogin('/logs/delivery/destinations');
    cy.wait('@getDestinations');
    cy.url().should('endWith', '/destinations');

    cy.get('table').should('exist').as('destinationsTable');

    // Assert that Create Destination button is visible and enabled
    ui.button
      .findByTitle('Create Destination')
      .should('be.visible')
      .and('be.enabled');

    // Assert that the correct number of Destinations entries are present in the DestinationsTable
    cy.get('@destinationsTable')
      .find('tbody tr')
      .should('have.length', mockDestinations.length);
  });

  describe('given Akamai Object Storage type destination', () => {
    it('displays destinations in the table with correct type label', () => {
      cy.visitWithLogin('/logs/delivery/destinations');
      cy.wait('@getDestinations');

      cy.get('table').should('exist');

      mockAkamaiObjectStorageDestinations.forEach((destination) => {
        cy.findByText(destination.label)
          .closest('tr')
          .within(() => {
            cy.findByText(destination.label).should('be.visible');
            cy.findByText('Akamai Object Storage').should('be.visible');
          });
      });
    });

    it('navigates to edit page when clicking destination label', () => {
      cy.visitWithLogin('/logs/delivery/destinations');
      cy.wait('@getDestinations');

      const destination = mockAkamaiObjectStorageDestinations[0];
      mockGetDestination(destination).as('getDestination');

      cy.findByText(destination.label).click();
      cy.url().should('endWith', `/destinations/${destination.id}/edit`);
      cy.wait('@getDestination');
    });

    it('checks action menu items are visible and enabled', () => {
      cy.visitWithLogin('/logs/delivery/destinations');
      cy.wait('@getDestinations');

      cy.get('table').should('exist').as('destinationsTable');

      checkActionMenu(
        '@destinationsTable',
        mockAkamaiObjectStorageDestinations
      );
    });

    it('navigates to edit page via action menu', () => {
      cy.visitWithLogin('/logs/delivery/destinations');
      cy.wait('@getDestinations');

      cy.get('table').should('exist').as('destinationsTable');

      editDestinationViaActionMenu(
        '@destinationsTable',
        mockAkamaiObjectStorageDestinations[0]
      );
    });

    it('shows delete confirmation dialog via action menu', () => {
      cy.visitWithLogin('/logs/delivery/destinations');
      cy.wait('@getDestinations');

      cy.get('table').should('exist').as('destinationsTable');

      deleteDestinationViaActionMenu(
        '@destinationsTable',
        mockAkamaiObjectStorageDestinations[0]
      );
    });
  });

  describe('given Custom HTTPS type destination', () => {
    it('displays destinations in the table with correct type label', () => {
      cy.visitWithLogin('/logs/delivery/destinations');
      cy.wait('@getDestinations');

      cy.get('table').should('exist');

      mockCustomHttpsDestinations.forEach((destination) => {
        cy.findByText(destination.label)
          .closest('tr')
          .within(() => {
            cy.findByText(destination.label).should('be.visible');
            cy.findByText('Custom HTTPS').should('be.visible');
          });
      });
    });

    it('navigates to edit page when clicking destination label', () => {
      cy.visitWithLogin('/logs/delivery/destinations');
      cy.wait('@getDestinations');

      const destination = mockCustomHttpsDestinations[0];
      mockGetDestination(destination).as('getDestination');

      cy.findByText(destination.label).click();
      cy.url().should('endWith', `/destinations/${destination.id}/summary`);
      cy.wait('@getDestination');
    });

    it('checks action menu items are visible and enabled', () => {
      cy.visitWithLogin('/logs/delivery/destinations');
      cy.wait('@getDestinations');

      cy.get('table').should('exist').as('destinationsTable');

      checkActionMenu('@destinationsTable', mockCustomHttpsDestinations);
    });

    it('navigates to edit page via action menu', () => {
      cy.visitWithLogin('/logs/delivery/destinations');
      cy.wait('@getDestinations');

      cy.get('table').should('exist').as('destinationsTable');

      editDestinationViaActionMenu(
        '@destinationsTable',
        mockCustomHttpsDestinations[0]
      );
    });

    it('shows delete confirmation dialog via action menu', () => {
      cy.visitWithLogin('/logs/delivery/destinations');
      cy.wait('@getDestinations');

      cy.get('table').should('exist').as('destinationsTable');

      deleteDestinationViaActionMenu(
        '@destinationsTable',
        mockCustomHttpsDestinations[1]
      );
    });
  });
});
