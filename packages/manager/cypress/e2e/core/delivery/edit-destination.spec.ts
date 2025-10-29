import {
  mockDestination,
  mockDestinationPayload,
  mockDestinationPayloadWithId,
} from 'support/constants/delivery';
import {
  mockGetDestination,
  mockGetDestinations,
  mockTestConnection,
  mockUpdateDestination,
} from 'support/intercepts/delivery';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { logsDestinationForm } from 'support/ui/pages/logs-destination-form';
import { randomLabel } from 'support/util/random';

import { getDestinationTypeOption } from 'src/features/Delivery/deliveryUtils';

import type { AkamaiObjectStorageDetailsExtended } from '@linode/api-v4';

describe('Edit Destination', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpLogs: { enabled: true, beta: true },
    });
    cy.visitWithLogin(`/logs/delivery/destinations/${mockDestination.id}/edit`);
    mockGetDestination(mockDestination);
  });

  it('destination type edit should be disabled', () => {
    cy.findByLabelText('Destination Type')
      .should('be.visible')
      .should('be.disabled')
      .should(
        'have.attr',
        'value',
        getDestinationTypeOption(mockDestination.type)?.label
      );
  });

  it('edit destination with incorrect data', () => {
    logsDestinationForm.fillDestinationDetailsForm(
      mockDestinationPayload.details as AkamaiObjectStorageDetailsExtended
    );

    // Create Destination should be disabled before test connection
    cy.findByRole('button', { name: 'Edit Destination' }).should('be.disabled');
    // Test connection of the destination form
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
    cy.findByRole('button', { name: 'Edit Destination' }).should('be.disabled');
  });

  it('edit destination with correct data', () => {
    const newLabel = randomLabel();
    // Give Destination a new label
    logsDestinationForm.setLabel(newLabel);

    logsDestinationForm.fillDestinationDetailsForm(
      mockDestinationPayload.details as AkamaiObjectStorageDetailsExtended
    );

    // Create Destination should be disabled before test connection
    cy.findByRole('button', { name: 'Edit Destination' }).should('be.disabled');
    // Test connection of the destination form
    mockTestConnection();
    ui.button
      .findByTitle('Test Connection')
      .should('be.enabled')
      .should('have.attr', 'type', 'button')
      .click();

    ui.toast.assertMessage(
      `Delivery connection test completed successfully. Data can now be sent using this configuration.`
    );

    const updatedDestination = { ...mockDestination, label: newLabel };
    mockUpdateDestination(mockDestinationPayloadWithId, updatedDestination);
    mockGetDestinations([updatedDestination]);
    // Submit the destination edit form
    cy.findByRole('button', { name: 'Edit Destination' })
      .should('be.enabled')
      .should('have.attr', 'type', 'button')
      .click();

    ui.toast.assertMessage(
      `Destination ${updatedDestination.label} edited successfully`
    );

    // Verify we redirect to the destinations landing page upon successful edit
    cy.url().should('endWith', 'destinations');

    // Verify the edited destination shows on the Destinations landing page
    cy.findByText(newLabel)
      .closest('tr')
      .within(() => {
        // Verify Destination label shows
        cy.findByText(newLabel).should('be.visible');
      });
  });
});
