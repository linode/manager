import { createVolume } from '@linode/api-v4/lib/volumes';
import { authenticate } from 'support/api/authentication';
import { interceptDeleteVolume } from 'support/intercepts/volumes';
import { ui } from 'support/ui';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { cleanUp } from 'support/util/cleanup';
import { pollVolumeStatus } from 'support/util/polling';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { volumeRequestPayloadFactory } from 'src/factories/volume';

import type { Volume } from '@linode/api-v4';
import type { VolumeRequestPayload } from '@linode/api-v4/lib/volumes';

// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
const pageSizeOverride = {
  PAGE_SIZE: 100,
};

/**
 * Creates a Volume and waits for it to become active.
 *
 * @param volumeRequest - Volume create request payload.
 *
 * @returns Promise that resolves to created Volume.
 */
const createActiveVolume = async (volumeRequest: VolumeRequestPayload) => {
  const volume = await createVolume(volumeRequest);
  await pollVolumeStatus(volume.id, 'active', new SimpleBackoffMethod(10000));
  return volume;
};

authenticate();
describe('volume delete flow', () => {
  before(() => {
    cleanUp('volumes');
  });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  /*
   * - Clicks "Delete" action menu item for volume but cancels operation.
   * - Clicks "Delete" action menu item for volume and confirms operation.
   * - Confirms that volume is still in landing page list after canceled operation.
   * - Confirms that volume is removed from landing page list after confirmed operation.
   * - Confirms that volume deletion toast is displayed.
   */
  it('deletes a volume', () => {
    const volumeRequest = volumeRequestPayloadFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    cy.defer(() => createActiveVolume(volumeRequest), 'creating volume').then(
      (volume: Volume) => {
        interceptDeleteVolume(volume.id).as('deleteVolume');
        cy.visitWithLogin('/volumes', {
          localStorageOverrides: pageSizeOverride,
        });

        // Confirm that volume is listed and initiate deletion.
        cy.findByText(volume.label).should('be.visible');
        cy.findByLabelText(`Action menu for Volume ${volume.label}`).click();
        cy.get('[data-qa-action-menu-item="Delete"]:visible')
          .should('be.visible')
          .click();

        // Cancel deletion when prompted to confirm.
        ui.dialog
          .findByTitle(`Delete Volume ${volume.label}?`)
          .should('be.visible')
          .within(() => {
            ui.buttonGroup
              .findButtonByTitle('Cancel')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that volume is still listed and initiate deletion again.
        cy.findByText(volume.label).should('be.visible');
        cy.findByLabelText(`Action menu for Volume ${volume.label}`).click();
        cy.get('[data-qa-action-menu-item="Delete"]:visible')
          .should('be.visible')
          .click();

        // Confirm deletion.
        ui.dialog
          .findByTitle(`Delete Volume ${volume.label}?`)
          .should('be.visible')
          .within(() => {
            cy.findByLabelText('Volume Label').should('be.visible').click();
            cy.focused().type(volume.label);

            ui.buttonGroup
              .findButtonByTitle('Delete')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that volume is deleted.
        cy.wait('@deleteVolume').its('response.statusCode').should('eq', 200);
        cy.findByText(volume.label).should('not.exist');
        ui.toast.assertMessage(`Volume ${volume.label} has been deleted.`);
      }
    );
  });
});
