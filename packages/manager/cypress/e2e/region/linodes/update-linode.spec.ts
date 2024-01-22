import type { Disk, Linode } from '@linode/api-v4';
import { createLinode, getLinodeDisks } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { interceptGetLinodeDetails } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { depaginate } from 'support/util/paginate';
import { randomLabel, randomString } from 'support/util/random';
import { describeRegions } from 'support/util/regions';

/*
 * Returns a Linode create payload for the given region.
 */
const makeLinodePayload = (region: string, booted: boolean) => {
  return createLinodeRequestFactory.build({
    label: randomLabel(),
    root_pass: randomString(32),
    region,
    booted,
  });
};

authenticate();
describeRegions('Can update Linodes', (region) => {
  before(() => {
    cleanUp('linodes');
  });

  /*
   * - Navigates to a Linode details page's "Settings" tab.
   * - Enters a new label and clicks "Save".
   * - Confirms that label is updated and shown on Linode landing page.
   */
  it('can update a Linode label', () => {
    cy.defer(
      createLinode(makeLinodePayload(region.id, true)),
      'creating Linode'
    ).then((linode: Linode) => {
      const newLabel = randomLabel();
      const oldLabel = linode.label;

      // Navigate to Linode details page.
      interceptGetLinodeDetails(linode.id).as('getLinode');
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.wait('@getLinode');

      // Click on 'Settings' tab.
      cy.findByText('Settings').should('be.visible').click();

      // Type in new label, click "Save".
      cy.get('[data-qa-panel="Linode Label"]')
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('Label')
            .should('be.visible')
            .click()
            .clear()
            .type(newLabel);

          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that label has been updated.
      ui.toast.assertMessage(
        `Successfully updated Linode label to ${newLabel}`
      );
      ui.entityHeader.find().within(() => {
        cy.findByText(newLabel).should('be.visible');
        cy.findByText('linodes').should('be.visible').click();
      });

      cy.url().should('endWith', '/linodes');
      cy.findByText(oldLabel).should('not.exist');
      cy.findByText(newLabel).should('be.visible');
    });
  });

  /*
   * - Navigates to a Linode details page's "Settings" tab.
   * - Enters a new password and clicks "Save".
   * - Confirms that successful toast notification appears.
   */
  it('can update a Linode root password', () => {
    const newPassword = randomString(32);

    const createLinodeAndGetDisk = async (): Promise<[Linode, Disk]> => {
      const linode = await createLinode(makeLinodePayload(region.id, false));
      const disks = await depaginate((page) =>
        getLinodeDisks(linode.id, { page })
      );

      // Throw if Linode has no disks. Shouldn't happen in practice.
      if (!disks[0]) {
        throw new Error('Created Linode does not have any disks');
      }
      return [linode, disks[0]];
    };

    cy.defer(createLinodeAndGetDisk(), 'creating Linode').then(
      ([linode, disk]: [Linode, Disk]) => {
        // Navigate to Linode details page.
        interceptGetLinodeDetails(linode.id).as('getLinode');
        cy.visitWithLogin(`/linodes/${linode.id}`);
        cy.wait('@getLinode');

        // Wait for Linode to finish provisioning.
        cy.findByText('PROVISIONING').should('not.exist');
        cy.findByText('OFFLINE').should('be.visible');

        // Click on 'Settings' tab.
        cy.findByText('Settings').should('be.visible').click();

        cy.get('[data-qa-panel="Reset Root Password"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Disk').should('be.visible').click().type(disk.label);

            ui.autocompletePopper
              .findByTitle(disk.label)
              .should('be.visible')
              .click();

            cy.findByLabelText('New Root Password')
              .should('be.visible')
              .click()
              .clear()
              .type(newPassword);

            ui.button
              .findByTitle('Save')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        ui.toast.assertMessage('Sucessfully changed password');
        // TODO Investigate whether e2e solution to test password can be done securely.
      }
    );
  });
});
