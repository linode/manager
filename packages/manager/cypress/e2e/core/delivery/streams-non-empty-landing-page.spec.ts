import { mockDestination } from 'support/constants/delivery';
import {
  mockDeleteStream,
  mockGetDestinations,
  mockGetStream,
  mockGetStreams,
  mockUpdateStream,
} from 'support/intercepts/delivery';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

import { streamFactory } from 'src/factories';

import type { Stream } from '@linode/api-v4';

function checkActionMenu(tableAlias: string, mockStreams: Stream[]) {
  mockStreams.forEach((stream) => {
    cy.get(tableAlias)
      .find('tbody tr')
      .should('contain', stream.label)
      .then(() => {
        // If the row contains the label, proceed with clicking the action menu
        ui.actionMenu
          .findByTitle(`Action menu for Stream ${stream.label}`)
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

        ui.actionMenuItem
          .findByTitle('Deactivate')
          .should('be.visible')
          .should('be.enabled');
      });

    // Close the action menu
    cy.get('body').click(0, 0);
  });
}

function deleteStreamViaActionMenu(tableAlias: string, stream: Stream) {
  cy.get(tableAlias)
    .find('tbody tr')
    .should('contain', stream.label)
    .then(() => {
      // If the row contains the label, proceed with clicking the action menu
      ui.actionMenu
        .findByTitle(`Action menu for Stream ${stream.label}`)
        .should('be.visible')
        .click();

      mockDeleteStream(404).as('deleteStream');

      // Delete stream
      ui.actionMenuItem.findByTitle('Delete').click();

      // Find confirmation modal
      cy.findByText(
        `Are you sure you want to delete "${stream.label}" stream?`
      );
      ui.button.findByTitle('Delete').click();

      cy.wait('@deleteStream');

      // Close confirmation modal after failure
      ui.button.findByTitle('Cancel').click();
    });
}

function editStreamViaActionMenu(tableAlias: string, stream: Stream) {
  cy.get(tableAlias)
    .find('tbody tr')
    .should('contain', stream.label)
    .then(() => {
      // If the row contains the label, proceed with clicking the action menu
      ui.actionMenu
        .findByTitle(`Action menu for Stream ${stream.label}`)
        .should('be.visible')
        .click();

      mockGetStream(stream);
      // Edit stream redirect
      ui.actionMenuItem.findByTitle('Edit').click();
      cy.url().should('endWith', `/streams/${stream.id}/edit`);
    });
}

function deactivateStreamViaActionMenu(tableAlias: string, stream: Stream) {
  cy.get(tableAlias)
    .find('tbody tr')
    .should('contain', stream.label)
    .then(() => {
      // If the row contains the label, proceed with clicking the action menu
      ui.actionMenu
        .findByTitle(`Action menu for Stream ${stream.label}`)
        .should('be.visible')
        .click();

      mockUpdateStream({
        ...stream,
        destinations: stream.destinations.map(({ id }) => id),
        id: stream.id,
        status: 'inactive',
      });

      // Deactivate stream
      ui.actionMenuItem.findByTitle('Deactivate').click();

      ui.toast.assertMessage(`Stream ${stream.label} deactivated`);
    });
}

const mockStreams: Stream[] = new Array(3)
  .fill(null)
  .map((_item: null, index: number): Stream => {
    return streamFactory.build({
      label: `Stream ${index}`,
    });
  });

describe('Streams non-empty landing page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpLogs: {
        enabled: true,
        beta: true,
        bypassAccountCapabilities: true,
      },
    });

    // Mock setup to display the Streams landing page in a non-empty state
    mockGetStreams(mockStreams).as('getStreams');

    // Alias the mockStreams array
    cy.wrap(mockStreams).as('mockStreams');
  });

  it('create stream button is enabled and user can see existing streams', () => {
    // Login and wait for application to load
    cy.visitWithLogin('/logs/delivery/streams');
    cy.wait('@getStreams');
    cy.url().should('endWith', '/streams');

    cy.get('table').should('exist').as('streamTable');

    // Assert that the Create Stream button is visible and enabled
    ui.button
      .findByTitle('Create Stream')
      .should('be.visible')
      .and('be.enabled');

    // Assert that the correct number of Streams entries are present in the table
    cy.get('@streamTable')
      .find('tbody tr')
      .should('have.length', mockStreams.length);

    checkActionMenu('@streamTable', mockStreams);
  });

  it('checks actions from stream menu actions and stream name', () => {
    cy.visitWithLogin('/logs/delivery/streams');
    cy.wait('@getStreams');
    cy.get('table').should('exist').as('streamsTable');

    const exampleStream = mockStreams[0];
    deleteStreamViaActionMenu('@streamsTable', exampleStream);
    deactivateStreamViaActionMenu('@streamsTable', exampleStream);

    mockGetStream(exampleStream).as('getStream');
    mockGetDestinations([mockDestination]).as('getDestinations');

    // Redirect to stream edit page via name
    cy.findByText(exampleStream.label).click();
    cy.url().should('endWith', `/streams/${exampleStream.id}/edit`);
    cy.wait(['@getStream', '@getDestinations']);

    // Redirect to stream edit page via menu item
    cy.visit('/logs/delivery/streams');
    cy.get('table').should('exist').as('streamsTable');
    editStreamViaActionMenu('@streamsTable', exampleStream);
  });
});
