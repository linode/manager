import { authenticate } from 'support/api/authentication';
import { createDestination } from 'support/api/delivery';
import {
  incorrectDestinationData,
  mockDestinationPayload,
  updatedDestinationData,
} from 'support/constants/delivery';
import {
  mockTestConnection,
  setLocalStorageLogsFlag,
} from 'support/intercepts/delivery';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { fillDestinationDetailsForm } from 'support/util/delivery';

import { getDestinationTypeOption } from 'src/features/Delivery/deliveryUtils';

import type { LinodeObjectStorageDetails } from '@linode/api-v4';

let destinationId: number;

authenticate();
before(() => {
  cleanUp('destinations');
  // create destination to test edit form on
  createDestination(mockDestinationPayload).then((destination) => {
    destinationId = destination.id;
  });
});

describe('Edit Destination (e2e)', () => {
  beforeEach(() => {
    setLocalStorageLogsFlag();
    cy.visitWithLogin(`/logs/delivery/destinations/${destinationId}/edit`);
  });

  it('destination type edit should be disabled', () => {
    cy.findByLabelText('Destination Type')
      .should('be.visible')
      .should('be.disabled')
      .should(
        'have.attr',
        'value',
        getDestinationTypeOption(mockDestinationPayload.type)?.label
      );
  });

  it('edit destination with incorrect data', () => {
    cy.tag('method:e2e');

    fillDestinationDetailsForm(
      incorrectDestinationData.details as LinodeObjectStorageDetails
    );

    // Create Destination should be disabled before test connection
    cy.findByRole('button', { name: 'Edit Destination' }).should('be.disabled');
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
    cy.findByRole('button', { name: 'Edit Destination' }).should('be.disabled');
  });

  it('edit destination with correct data', () => {
    // Give Destination a new label
    cy.findByLabelText('Destination Name')
      .should('be.visible')
      .should('be.enabled')
      .should('have.attr', 'placeholder', 'Destination Name')
      .clear();
    cy.focused().type(updatedDestinationData.label);

    fillDestinationDetailsForm(
      updatedDestinationData.details as LinodeObjectStorageDetails
    );

    // Create Destination should be disabled before test connection
    cy.findByRole('button', { name: 'Edit Destination' }).should('be.disabled');
    // Test connection of the destination form
    mockTestConnection(); // @TODO remove when API endpoint released
    ui.button
      .findByTitle('Test Connection')
      .should('be.enabled')
      .should('have.attr', 'type', 'button')
      .click();

    ui.toast.assertMessage(
      `Delivery connection test completed successfully. Data can now be sent using this configuration.`
    );

    // Submit the destination edit form
    cy.findByRole('button', { name: 'Edit Destination' })
      .should('be.enabled')
      .should('have.attr', 'type', 'button')
      .click();

    ui.toast.assertMessage(
      `Destination ${updatedDestinationData.label} edited successfully`
    );

    // Verify we redirect to the destinations landing page upon successful edit
    cy.url().should('endWith', 'destinations');

    // Verify the edited destination shows on the Destinations landing page
    cy.findByText(updatedDestinationData.label)
      .closest('tr')
      .within(() => {
        // Verify Destination label shows
        cy.findByText(updatedDestinationData.label).should('be.visible');
      });
  });
});
