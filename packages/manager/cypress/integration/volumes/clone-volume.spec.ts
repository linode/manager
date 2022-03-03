import { createVolume, Volume } from '@linode/api-v4/lib/volumes';
import { volumeRequestPayloadFactory } from 'src/factories/volume';
import { authenticate } from 'support/api/authentication';
import { randomNumber, randomLabel } from 'support/util/random';
//import { ui } from 'support/ui';

authenticate();
describe('volumes', () => {
  /**
   *
   */
  it('clones a volume', () => {
    const volumeRequest = volumeRequestPayloadFactory.build({
      label: randomLabel(),
    });

    const cloneVolumeLabel = randomLabel();

    cy.defer(createVolume(volumeRequest)).then((volume: Volume) => {
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

      // Confirm drawer opens, input new volume label, and submit.
      // ui.getDrawerByTitle('Clone Volume')
      //   .should('be.visible')
      //   .within(() => {
      //     cy.findByText('Label').click().type(cloneVolumeLabel);
      //     ui.getDrawerButtons().within(() => {
      //       cy.findByText('Clone Volume').click();
      //     });
      // });
    });
  });
});
