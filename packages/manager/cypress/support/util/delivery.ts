import { regions } from 'support/constants/delivery';
import { ui } from 'support/ui';

import type { LinodeObjectStorageDetails } from '@linode/api-v4';

const getRegionLabel = (regionId: string): string =>
  regions.find(({ id }) => id === regionId)?.label ?? '';

export const fillDestinationDetailsForm = (
  data: LinodeObjectStorageDetails
) => {
  // Give Destination a host
  cy.findByLabelText('Host')
    .should('be.visible')
    .should('be.enabled')
    .should('have.attr', 'placeholder', 'Host')
    .clear();
  cy.focused().type(data.host);

  // Give Destination a bucket
  cy.findByLabelText('Bucket')
    .should('be.visible')
    .should('be.enabled')
    .should('have.attr', 'placeholder', 'Bucket')
    .clear();
  cy.focused().type(data.bucket_name);

  // Find Region select and open it
  cy.findByLabelText('Region')
    .should('be.visible')
    .should('be.enabled')
    .should('have.attr', 'placeholder', 'Select a Region')
    .clear();
  // Select the Region
  ui.autocompletePopper
    .findByTitle(getRegionLabel(data.region))
    .should('be.visible')
    .should('be.enabled')
    .click();

  // Give the Destination Access Key ID
  cy.findByLabelText('Access Key ID')
    .should('be.enabled')
    .should('be.visible')
    .should('have.attr', 'placeholder', 'Access Key ID')
    .clear();
  cy.focused().type(data.access_key_id);

  // Give the Destination Secret Access Key
  cy.findByLabelText('Secret Access Key')
    .should('be.enabled')
    .should('be.visible')
    .should('have.attr', 'placeholder', 'Secret Access Key')
    .clear();
  cy.focused().type(data.access_key_secret);
};
