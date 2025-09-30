import {
  interceptDeleteDestination,
  mockGetDestination,
  mockGetDestinations,
  setLocalStorageLogsFlag,
} from 'support/intercepts/delivery';
import { ui } from 'support/ui';

import { destinationFactory } from 'src/factories';

import type { Destination } from '@linode/api-v4';

function checkActionMenu(tableAlias: string, mockDestinations: Destination[]) {
  mockDestinations.forEach((destination) => {
    cy.get(tableAlias)
      .find('tbody tr')
      .should('contain', destination.label)
      .then(($row) => {
        // If the row contains the label, proceed with clicking the action menu
        const actionButton = $row.find(
          `button[aria-label="Action menu for Destination ${destination.label}"]`
        );
        if (actionButton) {
          cy.wrap(actionButton).click();

          // Check that all items are enabled
          cy.get('ul[role="menu"]')
            .find('li')
            .each(($li) => {
              cy.wrap($li).should('be.visible').and('be.enabled');
            });

          // Close the action menu by clicking on Delivery Title of the screen
          cy.get('body').click(0, 0);
        }
      });
  });
}

function deleteItem(tableAlias: string, destination: Destination) {
  cy.get(tableAlias)
    .find('tbody tr')
    .should('contain', destination.label)
    .then(($row) => {
      // If the row contains the label, proceed with clicking the action menu
      const actionButton = $row.find(
        `button[aria-label="Action menu for Destination ${destination.label}"]`
      );
      if (actionButton) {
        cy.wrap(actionButton).click();

        interceptDeleteDestination(destination).as('deleteDestination');

        // Delete destination
        cy.get('ul[role="menu"]').findByText('Delete').click();
        cy.wait('@deleteDestination');
      }
    });
}

function editItemViaActionMenu(tableAlias: string, destination: Destination) {
  cy.get(tableAlias)
    .find('tbody tr')
    .should('contain', destination.label)
    .then(($row) => {
      // If the row contains the label, proceed with clicking the action menu
      const actionButton = $row.find(
        `button[aria-label="Action menu for Destination ${destination.label}"]`
      );
      if (actionButton) {
        cy.wrap(actionButton).click();

        mockGetDestination(destination);
        // Edit destination redirect
        cy.get('ul[role="menu"]').findByText('Edit').click();
        cy.url().should('endWith', `/destinations/${destination.id}/edit`);
      }
    });
}

describe('destinations landing checks for non-empty state', () => {
  beforeEach(() => {
    const mockDestinations: Destination[] = new Array(3)
      .fill(null)
      .map((_item: null, index: number): Destination => {
        return destinationFactory.build({
          label: `Destination ${index}`,
        });
      });

    // Mock setup to display the Destinations landing page in a non-empty state
    mockGetDestinations(mockDestinations).as('getDestinations');

    // Alias the mockDestinations array
    cy.wrap(mockDestinations).as('mockDestinations');
    setLocalStorageLogsFlag();
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

    cy.get<Destination[]>('@mockDestinations').then((mockDestinations) => {
      // Assert that the correct number of Destinations entries are present in the DestinationsTable
      cy.get('@destinationsTable')
        .find('tbody tr')
        .should('have.length', mockDestinations.length);

      checkActionMenu('@destinationsTable', mockDestinations); // For the recovery destination table
    });
  });

  it('checks actions from destination menu actions', () => {
    cy.visitWithLogin('/logs/delivery/destinations');
    cy.wait('@getDestinations');
    cy.get('table').should('exist').as('destinationsTable');

    cy.get<Destination[]>('@mockDestinations').then((mockDestinations) => {
      const exampleDestination = mockDestinations[0];
      deleteItem('@destinationsTable', exampleDestination);

      mockGetDestination(exampleDestination).as('getDestination');

      // Redirect to destination edit page via name
      cy.findByText(exampleDestination.label).click();
      cy.url().should('endWith', `/destinations/${exampleDestination.id}/edit`);
      cy.wait('@getDestination');

      cy.visit('/logs/delivery/destinations');
      cy.get('table').should('exist').as('destinationsTable');
      cy.wait('@getDestinations');
      editItemViaActionMenu('@destinationsTable', exampleDestination);
    });
  });
});
