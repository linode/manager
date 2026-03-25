/**
 * @file Page utilities for Logs Delivery Destination Form.
 * Create/Edit Destination Page
 * Create/Edit Stream Page
 */

import { authenticationType } from '@linode/api-v4';
import { ui } from 'support/ui';

import type {
  AkamaiObjectStorageDetailsExtended,
  ContentType,
  CustomHTTPSDetailsExtended,
} from '@linode/api-v4';

const setIfDefined = <T>(
  value: T | undefined,
  setter: (v: T) => void
): void => {
  if (value !== undefined) {
    setter(value);
  }
};

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
   * Selects a destination type from "Destination Type" Autocomplete dropdown
   *
   * @param destinationType - destination type to select from the dropdown
   */
  selectDestinationType: (destinationType: string) => {
    cy.findByLabelText('Destination Type')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.autocompletePopper
      .findByTitle(destinationType)
      .should('be.visible')
      .click();
  },

  // AkamaiObjectStorage destination

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
   * Fills all form fields related to AkamaiObjectStorageDetails destination's details
   *
   * @param data - object with destination details of AkamaiObjectStorageDetailsExtended type
   */
  fillAkamaiObjectStorageDestinationDetailsForm: (
    data: AkamaiObjectStorageDetailsExtended
  ) => {
    // Switch to manual bucket entry
    cy.findByLabelText('Enter Bucket manually').click();

    logsDestinationForm.setBucket(data.bucket_name);
    logsDestinationForm.setEndpoint(data.host);
    logsDestinationForm.setAccessKeyId(data.access_key_id);
    logsDestinationForm.setSecretAccessKey(data.access_key_secret);
  },

  // CustomHttps destination

  /**
   * Sets destination's authentication type
   *
   * @param authenticationType - destination authentication type to set
   */
  setAuthenticationType: (authenticationType: string) => {
    cy.findByLabelText('Authentication Type')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.autocompletePopper
      .findByTitle(authenticationType, { exact: false })
      .should('be.visible')
      .click();
  },

  /**
   * Sets destination's basic authentication's username
   *
   * @param username - destination authentication username to set
   */
  setBasicAuthenticationUsername: (username: string) => {
    cy.findByLabelText('Username')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(username);
  },

  /**
   * Sets destination's basic authentication's password
   *
   * @param password - destination authentication password to set
   */
  setBasicAuthenticationPassword: (password: string) => {
    cy.findByLabelText('Password')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(password);
  },

  /**
   * Sets destination's endpoint URL
   *
   * @param endpointUrl - destination label to set
   */
  setEndpointUrl: (endpointUrl: string) => {
    cy.findByLabelText('Endpoint URL')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(endpointUrl);
  },

  /**
   * Sets destination's TLS hostname
   *
   * @param tlsHostname - destination TLS hostname to set
   */
  setTlsHostname: (tlsHostname: string) => {
    cy.findByLabelText('TLS Hostname')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(tlsHostname);
  },

  /**
   * Sets destination's CA certificate
   *
   * @param caCertificate - destination CA certificate to set
   */
  setCaCertificate: (caCertificate: string) => {
    cy.findByLabelText('CA Certificate')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(caCertificate);
  },

  /**
   * Sets destination's client certificate
   *
   * @param clientCertificate - destination client certificate to set
   */
  setClientCertificate: (clientCertificate: string) => {
    cy.findByLabelText('Client Certificate')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(clientCertificate);
  },

  /**
   * Sets destination's client private key
   *
   * @param clientPrivateKey - destination client private key to set
   */
  setClientPrivateKeyCertificate: (clientPrivateKey: string) => {
    cy.findByLabelText('Client Private Key')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(clientPrivateKey);
  },

  /**
   * Sets destination's content type
   *
   * @param contentType - destination content type to set
   */
  setContentType: (contentType: ContentType) => {
    if (contentType) {
      cy.findByLabelText('Content Type')
        .should('be.visible')
        .should('be.enabled')
        .click();
      ui.autocompletePopper
        .findByTitle(contentType)
        .should('be.visible')
        .click();
    } else {
      cy.findByLabelText('Content Type')
        .should('be.visible')
        .should('be.enabled')
        .clear();
    }
  },

  /**
   * Clicks Add Custom Header button
   */
  addCustomHeader: () => {
    cy.findByRole('button', { name: 'Add Custom Header' })
      .should('be.visible')
      .should('be.enabled')
      .click();
  },

  /**
   * Adds a custom header if the number of existing custom headers is not sufficient
   * for the given index.
   *
   * @param index - the index of the custom header needed
   */
  addCustomHeaderIfNeeded: (index: number) => {
    cy.findByRole('button', { name: 'Add Custom Header' })
      .should('be.visible')
      .then(() => {
        const existingCustomHeadersCount = Cypress.$('label').filter(
          (_, el) => el.textContent?.trim() === 'Name'
        ).length;

        if (existingCustomHeadersCount <= index) {
          logsDestinationForm.addCustomHeader();
          cy.findAllByLabelText('Name').should('have.length', index + 1);
        }
      });
  },

  /**
   * Sets destination's custom header name and value based on the index of the header
   *
   * @param index - index of the custom header to set
   * @param name - custom header name
   * @param value - custom header value
   */
  setCustomHeader: (index: number, name: string, value: string) => {
    cy.findAllByLabelText('Name').eq(index).as('customHeaderNameInput');
    cy.get('@customHeaderNameInput').should('be.visible').should('be.enabled');
    cy.get('@customHeaderNameInput').clear();
    cy.get('@customHeaderNameInput').type(name);

    cy.findAllByLabelText('Value').eq(index).as('customHeaderValueInput');
    cy.get('@customHeaderValueInput').should('be.visible').should('be.enabled');
    cy.get('@customHeaderValueInput').clear();
    cy.get('@customHeaderValueInput').type(value);
  },

  /**
   * Fills all form fields related to CustomHttps destination's details
   *
   * @param data - object with destination details of CustomHTTPSDetailsExtended type
   */
  fillCustomHttpsDestinationDetailsForm: (data: CustomHTTPSDetailsExtended) => {
    logsDestinationForm.setEndpointUrl(data.endpoint_url);
    logsDestinationForm.setAuthenticationType(data.authentication.type);

    // Set authentication details if authentication type is basic
    if (
      data.authentication.type === authenticationType.Basic &&
      data.authentication.details
    ) {
      setIfDefined(
        data.authentication.details.basic_authentication_user,
        logsDestinationForm.setBasicAuthenticationUsername
      );
      setIfDefined(
        data.authentication.details.basic_authentication_password,
        logsDestinationForm.setBasicAuthenticationPassword
      );
    }

    setIfDefined(
      data.client_certificate_details?.tls_hostname,
      logsDestinationForm.setTlsHostname
    );
    setIfDefined(
      data.client_certificate_details?.client_ca_certificate,
      logsDestinationForm.setCaCertificate
    );
    setIfDefined(
      data.client_certificate_details?.client_certificate,
      logsDestinationForm.setClientCertificate
    );
    setIfDefined(
      data.client_certificate_details?.client_private_key,
      logsDestinationForm.setClientPrivateKeyCertificate
    );

    setIfDefined(data.content_type, logsDestinationForm.setContentType);

    if (data.custom_headers?.length) {
      data.custom_headers.forEach((header, index) => {
        logsDestinationForm.addCustomHeaderIfNeeded(index);
        logsDestinationForm.setCustomHeader(index, header.name, header.value);
      });
    }
  },
};
