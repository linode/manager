import { createVolume, Volume } from '@linode/api-v4';
import { volumeRequestPayloadFactory } from 'src/factories/volume';
import { authenticate } from 'support/api/authentication';
import { randomLabel } from 'support/util/random';

authenticate();
describe('volume clone flow', () => {
  /*
   * - Clicks "Clone" action menu item for volume, enters new label, and submits form.
   * - Confirms that new volume appears in landing page with expected label and size.
   */
  it('clones a volume', () => {
    const volumeRequest = volumeRequestPayloadFactory.build({
      label: randomLabel(),
    });

    const cloneVolumeLabel = randomLabel();

    cy.defer(createVolume(volumeRequest)).then((volume: Volume) => {
      cy.intercept('POST', `*/volumes/${volume.id}/clone`).as('cloneVolume');
      cy.visitWithLogin('/volumes');

      // Confirm that volume is listed, initiate clone.
      cy.findByText(volume.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByLabelText(`Action menu for Volume ${volume.label}`).click();
        });

      cy.get('[data-qa-action-menu-item="Clone"]:visible')
        .should('be.visible')
        .click();

      // Input new volume label and submit.
      cy.get('[data-qa-drawer-title="Clone Volume"]')
        .closest('[data-qa-drawer="true"]')
        .should('be.visible')
        .within(() => {
          cy.findByText('Label').click().type(cloneVolumeLabel);
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
    });
  });
});
