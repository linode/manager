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
import { mockGetBuckets } from 'support/intercepts/object-storage';
import { ui } from 'support/ui';
import { logsDestinationForm } from 'support/ui/pages/logs-destination-form';
import { randomLabel } from 'support/util/random';

import { objectStorageBucketFactory } from 'src/factories';
import { getDestinationTypeOption } from 'src/features/Delivery/deliveryUtils';

import type { AkamaiObjectStorageDetailsExtended } from '@linode/api-v4';

describe('Edit Destination', () => {
  const saveChangesButtonText = 'Save Changes';

  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpLogs: {
        enabled: true,
        beta: true,
        bypassAccountCapabilities: true,
      },
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

    // Save button should be disabled before test connection
    cy.findByRole('button', { name: saveChangesButtonText }).should(
      'be.disabled'
    );
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

    // Save button should be disabled after test connection failed
    cy.findByRole('button', { name: saveChangesButtonText }).should(
      'be.disabled'
    );
  });

  it('edit destination with correct data', () => {
    const newLabel = randomLabel();
    // Give Destination a new label
    logsDestinationForm.setLabel(newLabel);

    logsDestinationForm.fillDestinationDetailsForm(
      mockDestinationPayload.details as AkamaiObjectStorageDetailsExtended
    );

    // Save button should be disabled before test connection
    cy.findByRole('button', { name: saveChangesButtonText }).should(
      'be.disabled'
    );
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
    cy.findByRole('button', { name: saveChangesButtonText })
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

  describe('Bucket end Endpoint fields', () => {
    it('populates Bucket and Endpoint when selecting an existing bucket and manually entering data', () => {
      mockGetBuckets([
        objectStorageBucketFactory.build({
          hostname: 'bucket-hostname.us-east-1.linodeobjects.com',
          label: 'bucket-with-hostname',
          region: 'us-east',
        }),
        objectStorageBucketFactory.build({
          hostname: 'bucket-s3.eu-central-1.linodeobjects.com',
          label: 'bucket-with-s3-endpoint',
          region: 'eu-central',
          s3_endpoint: 'eu-central-1.linodeobjects.com',
        }),
      ]);

      // Edit mode defaults to manual bucket entry
      cy.findByLabelText('Enter Bucket manually').should('be.checked');

      // Endpoint should be enabled in manual mode
      cy.findByLabelText('Endpoint').should('be.enabled');

      // Switch to bucket_from_account - Bucket and Endpoint should be cleared
      cy.findByLabelText('Select Bucket associated with the account').click();
      cy.findByLabelText('Bucket').should('have.value', '');
      cy.findByLabelText('Endpoint').should('have.value', '');
      cy.findByLabelText('Endpoint').should('be.disabled');

      // Select a bucket without s3_endpoint - should use hostname as Endpoint
      logsDestinationForm.selectBucketFromDropdown('bucket-with-hostname');
      cy.findByLabelText('Bucket').should('have.value', 'bucket-with-hostname');
      cy.findByLabelText('Endpoint').should(
        'have.value',
        'bucket-hostname.us-east-1.linodeobjects.com'
      );

      // Select a bucket with s3_endpoint - should use s3_endpoint
      logsDestinationForm.selectBucketFromDropdown('bucket-with-s3-endpoint');
      cy.findByLabelText('Bucket').should(
        'have.value',
        'bucket-with-s3-endpoint'
      );
      cy.findByLabelText('Endpoint').should(
        'have.value',
        'eu-central-1.linodeobjects.com'
      );
    });
  });
});
