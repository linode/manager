import {
  mockAkamaiObjectStorageDestination,
  mockAkamaiObjectStorageDestinationPayload,
  mockCustomHttpsDestination,
  mockCustomHttpsDestinationPayload,
} from 'support/constants/delivery';
import {
  mockCreateDestination,
  mockGetDestinations,
  mockTestConnection,
} from 'support/intercepts/delivery';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetBuckets } from 'support/intercepts/object-storage';
import { ui } from 'support/ui';
import { logsDestinationForm } from 'support/ui/pages/logs-destination-form';

import { objectStorageBucketFactory } from 'src/factories';

import type {
  AkamaiObjectStorageDetailsExtended,
  CustomHTTPSDetailsExtended,
} from '@linode/api-v4';

describe('Create Destination', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpLogs: {
        enabled: true,
        beta: true,
        customHttpsEnabled: true,
        bypassAccountCapabilities: true,
      },
    });
    cy.visitWithLogin('/logs/delivery/destinations/create');
  });
  describe('given Akamai Object Storage type destination', () => {
    it('create destination with form', () => {
      // Fill in the form with valid data
      logsDestinationForm.setLabel(
        mockAkamaiObjectStorageDestinationPayload.label
      );
      logsDestinationForm.fillAkamaiObjectStorageDestinationDetailsForm(
        mockAkamaiObjectStorageDestinationPayload.details as AkamaiObjectStorageDetailsExtended
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
      mockCreateDestination(mockAkamaiObjectStorageDestination);
      mockGetDestinations([mockAkamaiObjectStorageDestination]);
      cy.findByRole('button', { name: 'Create Destination' })
        .should('be.enabled')
        .should('have.attr', 'type', 'button')
        .click();

      ui.toast.assertMessage(
        `Destination ${mockAkamaiObjectStorageDestination.label} created successfully`
      );

      // Verify we redirect to the destinations landing page upon successful creation
      cy.url().should('endWith', 'destinations');

      // Verify the newly created destination shows on the Destinations landing page
      cy.findByText(mockAkamaiObjectStorageDestination.label)
        .closest('tr')
        .within(() => {
          // Verify Destination label shows
          cy.findByText(mockAkamaiObjectStorageDestination.label).should(
            'be.visible'
          );
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

        // Default radio should be "Select Bucket associated with the account"
        cy.findByLabelText('Select Bucket associated with the account').should(
          'be.checked'
        );

        // Endpoint should be disabled in bucket_from_account mode
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

        // Select a bucket with s3_endpoint - should use s3_endpoint as Endpoint
        logsDestinationForm.selectBucketFromDropdown('bucket-with-s3-endpoint');
        cy.findByLabelText('Bucket').should(
          'have.value',
          'bucket-with-s3-endpoint'
        );
        cy.findByLabelText('Endpoint').should(
          'have.value',
          'eu-central-1.linodeobjects.com'
        );

        // Switch to manual mode and fill in values
        cy.findByLabelText('Enter Bucket details manually').click();
        logsDestinationForm.setBucket('my-manual-bucket');
        logsDestinationForm.setEndpoint('my-endpoint.com');

        cy.findByLabelText('Bucket').should('have.value', 'my-manual-bucket');
        cy.findByLabelText('Endpoint').should('have.value', 'my-endpoint.com');

        // Switch back to bucket_from_account
        cy.findByLabelText('Select Bucket associated with the account').click();

        // Both fields should be cleared
        cy.findByLabelText('Bucket').should('have.value', '');
        cy.findByLabelText('Endpoint').should('have.value', '');
      });
    });
  });

  describe('given Custom HTTPS type destination', () => {
    beforeEach(() => {
      logsDestinationForm.selectDestinationType('Custom HTTPS');
    });

    it('create destination with form', () => {
      // Fill in the form with valid data
      logsDestinationForm.setLabel(mockCustomHttpsDestinationPayload.label);
      logsDestinationForm.fillCustomHttpsDestinationDetailsForm(
        mockCustomHttpsDestinationPayload.details as CustomHTTPSDetailsExtended
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
      mockCreateDestination(mockCustomHttpsDestination);
      mockGetDestinations([mockCustomHttpsDestination]);
      cy.findByRole('button', { name: 'Create Destination' })
        .should('be.enabled')
        .should('have.attr', 'type', 'button')
        .click();

      ui.toast.assertMessage(
        `Destination ${mockCustomHttpsDestination.label} created successfully`
      );

      // Verify we redirect to the destinations landing page upon successful creation
      cy.url().should('endWith', 'destinations');

      // Verify the newly created destination shows on the Destinations landing page
      cy.findByText(mockCustomHttpsDestination.label)
        .closest('tr')
        .within(() => {
          // Verify Destination label shows
          cy.findByText(mockCustomHttpsDestination.label).should('be.visible');
        });
    });
  });
});
