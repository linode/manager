import { createVolume } from '@linode/api-v4/lib/volumes';
import { Volume } from '@linode/api-v4/types';
import { volumeRequestPayloadFactory } from 'src/factories/volume';
import { authenticate } from 'support/api/authentication';
import { interceptResizeVolume } from 'support/intercepts/volumes';
import { randomNumber, randomLabel } from 'support/util/random';

// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
const pageSizeOverride = {
  PAGE_SIZE: 100,
};

authenticate();
describe('volume resize flow', () => {
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
      size: oldSize,
    });

    cy.defer(createVolume(volumeRequest)).then((volume: Volume) => {
      interceptResizeVolume(volume.id).as('resizeVolume');
      cy.visitWithLogin('/volumes', {
        localStorageOverrides: pageSizeOverride,
      });

      // Confirm that volume is listed with expected size, initiate resize.
      cy.findByText(volume.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText(`${oldSize} GB`).should('be.visible');
          cy.findByLabelText(`Action menu for Volume ${volume.label}`).click();
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
      cy.findByText('Volume scheduled to be resized.')
        .should('be.visible')
        .closest('[data-qa-drawer="true"]')
        .within(() => {
          cy.findByText('Close').click();
        });

      cy.findByText(volume.label)
        .closest('tr')
        .within(() => {
          cy.findByText(`${newSize} GB`).should('be.visible');
        });
    });
  });
});
