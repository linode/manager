/**
 * @file Page utilities for Logs Delivery Destination Form.
 * Create/Edit Destination Page
 * Create/Edit Stream Page
 */

import { ui } from 'support/ui';

import type { AkamaiObjectStorageDetailsExtended } from '@linode/api-v4';

export const logsDestinationForm = {
  /**
   * Sets destination's label
   *
   * @param label - destination label to set
   */
  setLabel: (label: string) => {
    cy.findByLabelText('Destination Name')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(label);
  },

  /**
   * Selects a bucket from the "Select Bucket associated with the account" Autocomplete dropdown
   *
   * @param bucketLabel - bucket label to select from the dropdown
   */
  selectBucketFromDropdown: (bucketLabel: string) => {
    cy.findByLabelText('Bucket')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.autocompletePopper.findByTitle(bucketLabel).should('be.visible').click();
  },

  /**
   * Sets destination's endpoint
   *
   * @param endpoint - destination endpoint to set
   */
  setEndpoint: (endpoint: string) => {
    cy.findByLabelText('Endpoint')
      .should('be.visible')
      .should('be.enabled')
      .should('have.attr', 'placeholder', 'Endpoint for the destination')
      .clear();
    cy.focused().type(endpoint);
  },

  /**
   * Sets destination's bucket name
   *
   * @param bucketName - destination bucket name to set
   */
  setBucket: (bucketName: string) => {
    cy.findByLabelText('Bucket')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(bucketName);
  },

  /**
   * Sets destination's Access Key ID
   *
   * @param accessKeyId - destination access key id to set
   */
  setAccessKeyId: (accessKeyId: string) => {
    cy.findByLabelText('Access Key ID')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(accessKeyId);
  },

  /**
   * Sets destination's Secret Access Key
   *
   * @param secretAccessKey - destination secret access key to set
   */
  setSecretAccessKey: (secretAccessKey: string) => {
    cy.findByLabelText('Secret Access Key')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(secretAccessKey);
  },

  /**
   * Fills all form fields related to destination's details (AkamaiObjectStorageDetails type)
   *
   * @param data - object with destination details of AkamaiObjectStorageDetails type
   */
  fillDestinationDetailsForm: (data: AkamaiObjectStorageDetailsExtended) => {
    // Switch to manual bucket entry
    cy.findByLabelText('Enter Bucket manually').click();

    // Give Destination a bucket
    logsDestinationForm.setBucket(data.bucket_name);

    // Give Destination an endpoint
    logsDestinationForm.setEndpoint(data.host);

    // Give the Destination Access Key ID
    logsDestinationForm.setAccessKeyId(data.access_key_id);

    // Give the Destination Secret Access Key
    logsDestinationForm.setSecretAccessKey(data.access_key_secret);
  },
};
