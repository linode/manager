import type { VolumeRequestPayload } from '@linode/api-v4';
import { createVolume } from '@linode/api-v4';
import { Volume } from '@linode/api-v4';
import { volumeRequestPayloadFactory } from 'src/factories/volume';
import { authenticate } from 'support/api/authentication';
import { interceptResizeVolume } from 'support/intercepts/volumes';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { cleanUp } from 'support/util/cleanup';
import { pollVolumeStatus } from 'support/util/polling';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

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
describe('volume resize flow', () => {
  before(() => {
    cleanUp('volumes');
  });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  /*
   * - Clicks "Resize" action menu item for volume, enters new size, and submits form.
   * - Confirms that volume resize drawer appears after submitting form.
   * - Confirms that volume is displayed with new size in landing page list.
   */
  it('resizes a volume', () => {
    const oldSize = randomNumber(50, 150);
    const newSize = randomNumber(151, 300);

    const volumeRequest = volumeRequestPayloadFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
      size: oldSize,
    });

    cy.defer(() => createActiveVolume(volumeRequest), 'creating Volume').then(
      (volume: Volume) => {
        interceptResizeVolume(volume.id).as('resizeVolume');
        cy.visitWithLogin('/volumes', {
          localStorageOverrides: pageSizeOverride,
        });

        // Confirm that volume is listed with expected size, initiate resize.
        cy.findByText(volume.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('active').should('be.visible');
            cy.findByText(`${oldSize} GB`).should('be.visible');
            cy.findByLabelText(
              `Action menu for Volume ${volume.label}`
            ).click();
          });

        cy.get('[data-qa-action-menu-item="Resize"]:visible')
          .should('be.visible')
          .click();

        // Input new volume size and submit.
        cy.get('[data-qa-drawer="true"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Size')
              .click()
              .type(`{selectall}{backspace}${newSize}`);
            cy.get('[data-qa-buttons="true"]').within(() => {
              cy.findByText('Resize Volume').should('be.visible').click();
            });
          });

        // Confirm that volume is resized.
        cy.wait('@resizeVolume').its('response.statusCode').should('eq', 200);
        cy.findByText('Volume scheduled to be resized.').should('be.visible');

        cy.findByText(volume.label)
          .closest('tr')
          .within(() => {
            cy.findByText(`${newSize} GB`).should('be.visible');
          });
      }
    );
  });
});
