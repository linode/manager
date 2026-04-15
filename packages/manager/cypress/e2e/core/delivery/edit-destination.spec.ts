import {
  mockAkamaiObjectStorageDestination,
  mockAkamaiObjectStorageDestinationPayload,
  mockAkamaiObjectStorageDestinationPayloadWithId,
  mockCustomHttpsDestination,
  mockCustomHttpsDestinationPayload,
  mockCustomHttpsDestinationPayloadWithId,
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

import type {
  AkamaiObjectStorageDetailsExtended,
  CustomHTTPSDetailsExtended,
} from '@linode/api-v4';

describe('Edit Destination', () => {
  const saveChangesButtonText = 'Save Changes';

  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpLogs: {
        enabled: true,
        beta: true,
        customHttpsEnabled: true,
        bypassAccountCapabilities: true,
      },
    });
  });

  describe('given Akamai Object Storage type destination', () => {
    beforeEach(() => {
      cy.visitWithLogin(
        `/logs/delivery/destinations/${mockAkamaiObjectStorageDestination.id}/summary`
      );
      mockGetDestination(mockAkamaiObjectStorageDestination);
    });

    it('destination type edit should be disabled', () => {
      cy.findByLabelText('Destination Type')
        .should('be.visible')
        .should('be.disabled')
        .should(
          'have.attr',
          'value',
          getDestinationTypeOption(mockAkamaiObjectStorageDestination.type)
            ?.label
        );
    });

    it('edit destination with incorrect data', () => {
      logsDestinationForm.fillAkamaiObjectStorageDestinationDetailsForm(
        mockAkamaiObjectStorageDestinationPayload.details as AkamaiObjectStorageDetailsExtended
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

      logsDestinationForm.fillAkamaiObjectStorageDestinationDetailsForm(
        mockAkamaiObjectStorageDestinationPayload.details as AkamaiObjectStorageDetailsExtended
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

      const updatedDestination = {
        ...mockAkamaiObjectStorageDestination,
        label: newLabel,
      };
      mockUpdateDestination(
        mockAkamaiObjectStorageDestinationPayloadWithId,
        updatedDestination
      );
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
        cy.findByLabelText('Enter Bucket details manually').should(
          'be.checked'
        );

        // Endpoint should be enabled in manual mode
        cy.findByLabelText('Endpoint').should('be.enabled');

        // Switch to bucket_from_account - Bucket and Endpoint should be cleared
        cy.findByLabelText('Select Bucket associated with the account').click();
        cy.findByLabelText('Bucket').should('have.value', '');
        cy.findByLabelText('Endpoint').should('have.value', '');
        cy.findByLabelText('Endpoint').should('be.disabled');

        // Select a bucket without s3_endpoint - should use hostname as Endpoint
        logsDestinationForm.selectBucketFromDropdown('bucket-with-hostname');
        cy.findByLabelText('Bucket').should(
          'have.value',
          'bucket-with-hostname'
        );
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

  describe('given Custom HTTPS type destination', () => {
    beforeEach(() => {
      cy.visitWithLogin(
        `/logs/delivery/destinations/${mockCustomHttpsDestination.id}/summary`
      );
      mockGetDestination(mockCustomHttpsDestination);
    });

    it('destination type edit should be disabled', () => {
      cy.findByLabelText('Destination Type')
        .should('be.visible')
        .should('be.disabled')
        .should(
          'have.attr',
          'value',
          getDestinationTypeOption(mockCustomHttpsDestination.type)?.label
        );
    });

    it('edit destination with correct data', () => {
      const newLabel = randomLabel();
      // Give Destination a new label
      logsDestinationForm.setLabel(newLabel);

      logsDestinationForm.fillCustomHttpsDestinationDetailsForm(
        mockCustomHttpsDestinationPayload.details as CustomHTTPSDetailsExtended
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

      const updatedDestination = {
        ...mockCustomHttpsDestination,
        label: newLabel,
      };
      mockUpdateDestination(
        mockCustomHttpsDestinationPayloadWithId,
        updatedDestination
      );
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
  });
});
