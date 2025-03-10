import { authenticate } from 'support/api/authentication';
import { createActiveVolume } from 'support/api/volumes';
import { interceptCloneVolume } from 'support/intercepts/volumes';
import { cleanUp } from 'support/util/cleanup';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { volumeRequestPayloadFactory } from 'src/factories/volume';

import type { Volume } from '@linode/api-v4';

// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
const pageSizeOverride = {
  PAGE_SIZE: 100,
};

authenticate();
describe('volume clone flow', () => {
  before(() => {
    cleanUp('volumes');
  });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  /*
   * - Clicks "Clone" action menu item for volume, enters new label, and submits form.
   * - Confirms that new volume appears in landing page with expected label and size.
   */
  it('clones a volume', () => {
    const volumeRequest = volumeRequestPayloadFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const cloneVolumeLabel = randomLabel();

    cy.defer(() => createActiveVolume(volumeRequest), 'creating volume').then(
      (volume: Volume) => {
        interceptCloneVolume(volume.id).as('cloneVolume');
        cy.visitWithLogin('/volumes', {
          localStorageOverrides: pageSizeOverride,
        });

        // Confirm that volume is listed, initiate clone.
        cy.findByText(volume.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('active').should('be.visible');
            cy.findByLabelText(
              `Action menu for Volume ${volume.label}`
            ).click();
          });

        cy.get('[data-qa-action-menu-item="Clone"]:visible')
          .should('be.visible')
          .click();

        // Input new volume label and submit.
        cy.get('[data-qa-drawer-title="Clone Volume"]')
          .closest('[data-qa-drawer="true"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Label').click();
            cy.focused().type(cloneVolumeLabel);
            cy.get('[data-qa-buttons="true"]').within(() => {
              cy.findByText('Clone Volume').should('be.visible').click();
            });
          });

        // Confirm that volume has been cloned.
        cy.wait('@cloneVolume').its('response.statusCode').should('eq', 200);
        cy.findByText(cloneVolumeLabel)
          .closest('tr')
          .within(() => {
            cy.findByText(`${volume.size} GB`).should('be.visible');
          });
      }
    );
  });
});
