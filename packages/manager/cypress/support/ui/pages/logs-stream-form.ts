import { mockDestinationPayload } from 'support/constants/delivery';
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
  StreamType,
} from '@linode/api-v4';

export const logsStreamForm = {
  /**
   * Sets stream's label
   *
   * @param label - stream label to set
   */
  setLabel: (label: string) => {
    cy.findByLabelText('Name')
      .should('be.visible')
      .should('be.enabled')
      .should('have.attr', 'placeholder', 'Stream name')
      .clear();
    cy.focused().type(label);
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
      .should('have.attr', 'placeholder', 'Create or Select Destination Name')
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
   * Fills all form fields related to destination's details (AkamaiObjectStorageDetails type)
   *
   * @param label - new destination label to set
   * @param details - object with destination details of AkamaiObjectStorageDetails type
   */
  fillOutNewAkamaiObjectStorageDestination: (
    label = randomLabel(),
    details: AkamaiObjectStorageDetailsExtended = mockDestinationPayload.details as AkamaiObjectStorageDetailsExtended
  ) => {
    // Create new destination label
    cy.findByLabelText('Destination Name')
      .should('be.visible')
      .should('be.enabled')
      .should('have.attr', 'placeholder', 'Create or Select Destination Name')
      .clear();
    cy.focused().type(label);
    cy.findByText(new RegExp(`"${label}"`)).click();

    // Fills all form fields related to destination's details
    logsDestinationForm.fillDestinationDetailsForm(details);
  },
};
