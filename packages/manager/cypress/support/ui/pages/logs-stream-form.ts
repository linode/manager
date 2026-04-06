import {
  mockAkamaiObjectStorageDestinationPayload,
  mockCustomHttpsDestinationPayload,
} from 'support/constants/delivery';
/**
 * @file Page utilities for Logs Delivery Stream Form.
 * Create/Edit Stream Page
 */
import { ui } from 'support/ui';
import { logsDestinationForm } from 'support/ui/pages/logs-destination-form';
import { randomLabel } from 'support/util/random';

import { getStreamTypeOption } from 'src/features/Delivery/deliveryUtils';

import type {
  AkamaiObjectStorageDetailsExtended,
  CustomHTTPSDetailsExtended,
  StreamType,
} from '@linode/api-v4';

export const logsStreamForm = {
  /**
   * Sets stream's label
   *
   * @param label - stream label to set
   */
  setLabel: (label: string) => {
    cy.findByLabelText('Stream Name')
      .should('be.visible')
      .should('be.enabled')
      .clear();
    cy.focused().type(label);
  },

  /**
   * Sets destination's label
   *
   * @param label - destination label to set
   */
  setDestinationLabel: (label: string) => {
    cy.findByLabelText('Destination Name')
      .should('be.visible')
      .should('be.enabled')
      .should(
        'have.attr',
        'placeholder',
        'Select existing or enter new destination'
      )
      .clear();
    cy.focused().type(label);
    cy.findByText(new RegExp(`"${label}"`)).click();
  },

  /**
   * Selects stream type
   *
   * @param type - stream type to set
   */
  selectStreamType: (type: StreamType) => {
    // Find Stream Type select and open it
    cy.findByLabelText('Stream Type')
      .should('be.visible')
      .should('be.enabled')
      .click();
    // Select the Stream Type
    ui.autocompletePopper
      .findByTitle(getStreamTypeOption(type)!.label)
      .should('be.visible')
      .should('be.enabled')
      .click();
  },

  /**
   * Selects destination label from Destination Name autocomplete
   *
   * @param label - destination name to select
   */
  selectExistingDestination: (label: string) => {
    cy.findByLabelText('Destination Name')
      .should('be.visible')
      .should('be.enabled')
      .should(
        'have.attr',
        'placeholder',
        'Select existing or enter new destination'
      )
      .clear();
    // Select the Destination Name
    ui.autocompletePopper
      .findByTitle(label)
      .should('be.visible')
      .should('be.enabled')
      .click();
  },

  /**
   * Finds the cluster checkbox by its label text or 'all' for the toggle all clusters checkbox.
   *
   * @param label - Cluster label or 'all' for the toggle all clusters checkbox.
   * @returns Cypress chainable for the checkbox input.
   */
  findClusterCheckbox: (label: string) => {
    const ariaLabel =
      label === 'all' ? 'Toggle all clusters' : `Toggle ${label} cluster`;
    return cy.findByLabelText(ariaLabel).find('input[type="checkbox"]');
  },

  /**
   * Fills all form fields related to Akamai Object Storage destination's details
   *
   * @param label - new destination label to set
   * @param details - object with destination details of AkamaiObjectStorageDetailsExtended type
   */
  fillOutNewAkamaiObjectStorageDestination: (
    label = randomLabel(),
    details: AkamaiObjectStorageDetailsExtended = mockAkamaiObjectStorageDestinationPayload.details as AkamaiObjectStorageDetailsExtended
  ) => {
    logsStreamForm.setDestinationLabel(label);

    // Fills all form fields related to destination's details
    logsDestinationForm.fillAkamaiObjectStorageDestinationDetailsForm(details);
  },

  /**
   * Fills all form fields related to Custom HTTPS destination's details
   *
   * @param label - new destination label to set
   * @param details - object with destination details of CustomHTTPSDetailsExtended type
   */
  fillOutNewCustomHttpsDestination: (
    label = randomLabel(),
    details: CustomHTTPSDetailsExtended = mockCustomHttpsDestinationPayload.details as CustomHTTPSDetailsExtended
  ) => {
    // Select Custom HTTPS destination type first (changing type resets the form)
    logsDestinationForm.selectDestinationType('Custom HTTPS');

    // Create new destination label
    logsStreamForm.setDestinationLabel(label);

    // Fills all form fields related to destination's details
    logsDestinationForm.fillCustomHttpsDestinationDetailsForm(details);
  },
};
