import {
  mockDestination,
  mockDestinationPayload,
} from 'support/constants/delivery';
import {
  mockCreateDestination,
  mockGetDestinations,
  mockTestConnection,
} from 'support/intercepts/delivery';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { logsDestinationForm } from 'support/ui/pages/logs-destination-form';

import type { AkamaiObjectStorageDetailsExtended } from '@linode/api-v4';

describe('Create Destination', () => {
  before(() => {
    mockAppendFeatureFlags({
      aclpLogs: { enabled: true, beta: true },
    });
  });

  it('create destination with form', () => {
    cy.visitWithLogin('/logs/delivery/destinations/create');

    // Give Destination a label
    logsDestinationForm.setLabel(mockDestinationPayload.label);

    logsDestinationForm.fillDestinationDetailsForm(
      mockDestinationPayload.details as AkamaiObjectStorageDetailsExtended
    );

    // Create Destination should be disabled before test connection
    cy.findByRole('button', { name: 'Create Destination' }).should(
      'be.disabled'
    );

    // Test connection of the destination form - failure
    mockTestConnection(400);
    ui.button
      .findByTitle('Test Connection')
      .should('be.enabled')
      .should('have.attr', 'type', 'button')
      .click();

    ui.toast.assertMessage(
      'Delivery connection test failed. Verify your delivery settings and try again.'
    );

    // Create Destination should be disabled after test connection failed
    cy.findByRole('button', { name: 'Create Destination' }).should(
      'be.disabled'
    );

    // Test connection of the destination form - success
    mockTestConnection(200);
    ui.button
      .findByTitle('Test Connection')
      .should('be.enabled')
      .should('have.attr', 'type', 'button')
      .click();

    ui.toast.assertMessage(
      `Delivery connection test completed successfully. Data can now be sent using this configuration.`
    );

    // Submit the destination create form - failure
    mockCreateDestination({}, 400);
    cy.findByRole('button', { name: 'Create Destination' })
      .should('be.enabled')
      .should('have.attr', 'type', 'button')
      .click();

    ui.toast.assertMessage(`There was an issue creating your destination`);

    // Submit the destination create form - success
    mockCreateDestination(mockDestination);
    mockGetDestinations([mockDestination]);
    cy.findByRole('button', { name: 'Create Destination' })
      .should('be.enabled')
      .should('have.attr', 'type', 'button')
      .click();

    ui.toast.assertMessage(
      `Destination ${mockDestination.label} created successfully`
    );

    // Verify we redirect to the destinations landing page upon successful creation
    cy.url().should('endWith', 'destinations');

    // Verify the newly created destination shows on the Destinations landing page
    cy.findByText(mockDestination.label)
      .closest('tr')
      .within(() => {
        // Verify Destination label shows
        cy.findByText(mockDestination.label).should('be.visible');
      });
  });
});
