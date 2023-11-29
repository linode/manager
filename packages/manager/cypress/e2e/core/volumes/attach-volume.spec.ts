import { createLinode } from '@linode/api-v4/lib/linodes';
import { createVolume } from '@linode/api-v4/lib/volumes';
import { Linode, Volume } from '@linode/api-v4/types';
import { createLinodeRequestFactory } from 'src/factories/linodes';
import { volumeRequestPayloadFactory } from 'src/factories/volume';
import { authenticate } from 'support/api/authentication';
import {
  interceptAttachVolume,
  interceptDetachVolume,
} from 'support/intercepts/volumes';
import { randomLabel, randomString } from 'support/util/random';
import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';
import { interceptGetLinodeConfigs } from 'support/intercepts/configs';
import { cleanUp } from 'support/util/cleanup';

// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
const pageSizeOverride = {
  PAGE_SIZE: 100,
};

/**
 * Creates a Linode and a Volume that is attached to the created Linode.
 *
 * @returns Promise that resolves to an array containing created Linode and Volume.
 */
const createLinodeAndAttachVolume = async (): Promise<[Linode, Volume]> => {
  const commonRegion = chooseRegion();
  const linodeRequest = createLinodeRequestFactory.build({
    label: randomLabel(),
    region: commonRegion.id,
    root_pass: randomString(32),
  });

  const linode = await createLinode(linodeRequest);
  const volumeRequest = volumeRequestPayloadFactory.build({
    label: randomLabel(),
    region: commonRegion.id,
    linode_id: linode.id,
  });
  const volume = await createVolume(volumeRequest);
  return [linode, volume];
};

authenticate();
describe('volume attach and detach flows', () => {
  before(() => {
    cleanUp('volumes');
  });

  /*
   * - Clicks "Attach" action menu item for volume, selects Linode with common region, and submits form.
   * - Confirms that volume attach toast appears and that Linode is listed as attached for Volume.
   */
  it('attaches a volume to a Linode', () => {
    const commonRegion = chooseRegion();
    const volumeRequest = volumeRequestPayloadFactory.build({
      label: randomLabel(),
      region: commonRegion.id,
    });

    const linodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: commonRegion.id,
      root_pass: randomString(32),
    });

    const entityPromise = Promise.all([
      createVolume(volumeRequest),
      createLinode(linodeRequest),
    ]);

    cy.defer(entityPromise, 'creating Volume and Linode').then(
      ([volume, linode]: [Volume, Linode]) => {
        interceptAttachVolume(volume.id).as('attachVolume');
        interceptGetLinodeConfigs(linode.id).as('getLinodeConfigs');
        cy.visitWithLogin('/volumes', {
          localStorageOverrides: pageSizeOverride,
        });

        // Confirm that volume is listed, initiate attachment.
        cy.findByText(volume.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByLabelText(
              `Action menu for Volume ${volume.label}`
            ).click();
          });

        cy.get('[data-qa-action-menu-item="Attach"]:visible')
          .should('be.visible')
          .click();

        ui.drawer.findByTitle(`Attach Volume ${volume.label}`).within(() => {
          cy.findByLabelText('Linode')
            .should('be.visible')
            .click()
            .type(linode.label);

          ui.autocompletePopper
            .findByTitle(linode.label)
            .should('be.visible')
            .click();

          cy.wait('@getLinodeConfigs');

          ui.button.findByTitle('Attach').should('be.visible').click();
        });

        // Confirm that volume has been attached to Linode.
        cy.wait('@attachVolume').its('response.statusCode').should('eq', 200);
        ui.toast.assertMessage(`Volume ${volume.label} successfully attached.`);
        cy.findByText(volume.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText(linode.label).should('be.visible');
          });
      }
    );
  });

  // TODO Unskip once volume detach issue is resolved.
  /*
   * - Clicks "Detach" action menu item for volume.
   * - Confirms that volume detach toast appears and that Linode is no longer listed as attached for Volume.
   */
  // it.skip('detaches a volume from a Linode', () => {
  //   cy.defer(
  //     createLinodeAndAttachVolume(),
  //     'creating attached Volume and Linode'
  //   ).then(([linode, volume]: [Linode, Volume]) => {
  //     interceptDetachVolume(volume.id).as('detachVolume');

  //     // @TODO Wait for Linode to finish provisioning before initiating detach.
  //     cy.visitWithLogin('/volumes', {
  //       localStorageOverrides: pageSizeOverride,
  //     });

  //     // Confirm that volume is listed, initiate detachment.
  //     cy.findByText(volume.label)
  //       .should('be.visible')
  //       .closest('tr')
  //       .within(() => {
  //         cy.findByLabelText(`Action menu for Volume ${volume.label}`).click();
  //       });

  //     cy.get('[data-qa-action-menu-item="Detach"]:visible')
  //       .should('be.visible')
  //       .click();

  //     cy.findByText(`Detach Volume ${volume.label}?`)
  //       .should('be.visible')
  //       .closest('[role="dialog"]')
  //       .within(() => {
  //         cy.findByText('Detach Volume').should('be.visible').click();
  //       });

  //     // Confirm that volume has been detached.
  //     cy.wait('@detachVolume').its('response.statusCode').should('eq', 200);
  //     // @TODO Improve toast check.
  //     cy.findByText(`Volume ${volume.label} successfully detached.`);
  //     cy.findByText(volume.label)
  //       .should('be.visible')
  //       .closest('tr')
  //       .within(() => {
  //         cy.findByText('Unattached').should('be.visible');
  //         cy.findByText(linode.label).should('not.exist');
  //       });
  //   });
  // });

  // TODO Unskip once volume detach issue is resolved.
  /*
   * - Clicks "Detach" action menu item for volume on Linode details page.
   * - Confirms that volume is no longer listed on Linode details page.
   * - Confirms that Linode is no longer listed as attached to Volume on Volumes landing page.
   */
  // it.skip('detaches a volume from a Linode via Linode details page', () => {
  //   cy.defer(
  //     createLinodeAndAttachVolume(),
  //     'creating attached Volume and Linode'
  //   ).then(([linode, volume]: [Linode, Volume]) => {
  //     // Wait for Linode to finish provisioning and booting.
  //     cy.visitWithLogin(`/linodes/${linode.id}/storage`);
  //     cy.get('[data-qa-linode-status="true"]').within(() => {
  //       cy.findByText('RUNNING').should('be.visible');
  //     });

  //     // Confirm that Volume is listed on Linode details page and initiate detachment.
  //     cy.findByLabelText('List of volume').within(() => {
  //       cy.findByText(volume.label)
  //         .closest('tr')
  //         .within(() => {
  //           cy.findByLabelText(`Action menu for Volume ${volume.label}`)
  //             .should('be.visible')
  //             .click();
  //         });
  //     });

  //     cy.get('[data-qa-action-menu-item="Detach"]:visible')
  //       .should('be.visible')
  //       .click();

  //     cy.findByText(`Detach Volume ${volume.label}?`)
  //       .should('be.visible')
  //       .closest('[role="dialog"]')
  //       .within(() => {
  //         cy.findByText('Detach Volume').should('be.visible').click();
  //       });

  //     // Confirm that Volume is no longer listed on Linode details page.
  //     cy.findByLabelText('List of volume').within(() => {
  //       cy.findByText(volume.label).should('not.exist');
  //     });

  //     // Confirm that Volume is no longer shown as attached on Volumes landing page.
  //     cy.visitWithLogin('/volumes');
  //     cy.findByText(volume.label)
  //       .should('be.visible')
  //       .closest('tr')
  //       .within(() => {
  //         cy.findByText('Unattached').should('be.visible');
  //         cy.findByText(linode.label).should('not.to.exist');
  //       });
  //   });
  // });
});
