import { authenticate } from 'support/api/authentication';
import {
  incorrectDestinationData,
  mockDestinationPayload,
} from 'support/constants/delivery';
import {
  mockTestConnection,
  setLocalStorageLogsFlag,
} from 'support/intercepts/delivery';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { fillDestinationDetailsForm } from 'support/util/delivery';
import { randomLabel } from 'support/util/random';

import type { LinodeObjectStorageDetails } from '@linode/api-v4';

authenticate();
describe('Create Destination (e2e)', () => {
  before(() => {
    cleanUp('destinations');
    setLocalStorageLogsFlag();
  });

  it('create destination with form', () => {
    cy.tag('method:e2e');
    const label = randomLabel();

    cy.visitWithLogin('/logs/delivery/destinations/create');

    // Give Destination a label
    cy.findByLabelText('Destination Name')
      .should('be.visible')
      .should('be.enabled')
      .should('have.attr', 'placeholder', 'Destination Name')
      .click();
    cy.focused().type(label);

    fillDestinationDetailsForm(
      incorrectDestinationData.details as LinodeObjectStorageDetails
    );

    // Create Destination should be disabled before test connection
    cy.findByRole('button', { name: 'Create Destination' }).should(
      'be.disabled'
    );

    // Test connection of the destination form
    mockTestConnection(400); // @TODO remove when API endpoint released
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

    fillDestinationDetailsForm(
      mockDestinationPayload.details as LinodeObjectStorageDetails
    );

    // Test connection of the destination form
    mockTestConnection(200); // @TODO remove when API endpoint released
    ui.button
      .findByTitle('Test Connection')
      .should('be.enabled')
      .should('have.attr', 'type', 'button')
      .click();

    ui.toast.assertMessage(
      `Delivery connection test completed successfully. Data can now be sent using this configuration.`
    );

    // Submit the destination create form
    cy.findByRole('button', { name: 'Create Destination' })
      .should('be.enabled')
      .should('have.attr', 'type', 'button')
      .click();

    ui.toast.assertMessage(`Destination ${label} created successfully`);

    // Verify we redirect to the destinations landing page upon successful creation
    cy.url().should('endWith', 'destinations');

    // Verify the newly created destination shows on the Destinations landing page
    cy.findByText(label)
      .closest('tr')
      .within(() => {
        // Verify Destination label shows
        cy.findByText(label).should('be.visible');
      });
  });
});
