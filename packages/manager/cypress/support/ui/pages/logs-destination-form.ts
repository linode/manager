/**
 * @file Page utilities for Logs Delivery Destination Form.
 * Create/Edit Destination Page
 * Create/Edit Stream Page
 */

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
      .should('have.attr', 'placeholder', 'Destination Name')
      .clear();
    cy.focused().type(label);
  },

  /**
   * Sets destination's host
   *
   * @param host - destination host to set
   */
  setHost: (host: string) => {
    cy.findByLabelText('Host')
      .should('be.visible')
      .should('be.enabled')
      .should('have.attr', 'placeholder', 'Host')
      .clear();
    cy.focused().type(host);
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
      .should('have.attr', 'placeholder', 'Bucket')
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
      .should('have.attr', 'placeholder', 'Access Key ID')
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
      .should('have.attr', 'placeholder', 'Secret Access Key')
      .clear();
    cy.focused().type(secretAccessKey);
  },

  /**
   * Fills all form fields related to destination's details (AkamaiObjectStorageDetails type)
   *
   * @param data - object with destination details of AkamaiObjectStorageDetails type
   */
  fillDestinationDetailsForm: (data: AkamaiObjectStorageDetailsExtended) => {
    // Give Destination a host
    logsDestinationForm.setHost(data.host);

    // Give Destination a bucket
    logsDestinationForm.setBucket(data.bucket_name);

    // Give the Destination Access Key ID
    logsDestinationForm.setAccessKeyId(data.access_key_id);

    // Give the Destination Secret Access Key
    logsDestinationForm.setSecretAccessKey(data.access_key_secret);
  },
};
