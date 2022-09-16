import { createVolume, Volume } from '@linode/api-v4/lib/volumes';
import { volumeRequestPayloadFactory } from 'src/factories/volume';
import { authenticate } from 'support/api/authentication';
import { assertToast } from 'support/ui/events';
import { randomLabel } from 'support/util/random';

// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
const pageSizeOverride = {
  PAGE_SIZE: 100,
};

authenticate();
describe('volume delete flow', () => {
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
    });

    cy.defer(createVolume(volumeRequest)).then((volume: Volume) => {
      cy.intercept('DELETE', '*/volumes/*').as('deleteVolume');
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
      cy.findByText(`Delete Volume ${volume.label}?`)
        .should('be.visible')
        .closest('div[role="dialog"]')
        .within(() => {
          cy.findByText('Cancel').click();
        });

      // Confirm that volume is still listed and initiate deletion again.
      cy.findByText(volume.label).should('be.visible');
      cy.findByLabelText(`Action menu for Volume ${volume.label}`).click();
      cy.get('[data-qa-action-menu-item="Delete"]:visible')
        .should('be.visible')
        .click();

      // Confirm deletion.
      cy.findByText(`Delete Volume ${volume.label}?`)
        .should('be.visible')
        .closest('div[role="dialog"]')
        .within(() => {
          cy.findByText('Delete Volume').click();
        });

      // Confirm that volume is deleted.
      cy.wait('@deleteVolume').its('response.statusCode').should('eq', 200);
      cy.findByText(volume.label).should('not.exist');
      assertToast('Volume successfully deleted.');
    });
  });
});
