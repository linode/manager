import type { Linode } from '@linode/api-v4';
import { createLinode } from '@linode/api-v4';
import { createLinodeRequestFactory, linodeFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import {
  interceptGetLinodeDetails,
  interceptRebootLinodeIntoRescueMode,
  mockGetLinodeDetails,
  mockRebootLinodeIntoRescueModeError,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

// Submits the Rescue Linode dialog, initiating reboot into rescue mode.
const rebootInRescueMode = () => {
  ui.button
    .findByTitle('Reboot into Rescue Mode')
    .should('be.visible')
    .should('be.enabled')
    .click();
};

authenticate();
describe('Rescue Linodes', () => {
  before(() => {
    cleanUp(['linodes', 'lke-clusters']);
  });

  /*
   * - Creates a Linode, waits for it to boot, and reboots it into rescue mode.
   * - Confirms that rescue mode API requests succeed.
   * - Confirms that Linode status changes to "Rebooting".
   * - Confirms that toast appears confirming successful reboot into rescue mode.
   */
  it('Can reboot a Linode into rescue mode', () => {
    const linodePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    cy.defer(createLinode(linodePayload), 'creating Linode').then(
      (linode: Linode) => {
        interceptGetLinodeDetails(linode.id).as('getLinode');
        interceptRebootLinodeIntoRescueMode(linode.id).as(
          'rebootLinodeRescueMode'
        );

        const rescueUrl = `/linodes/${linode.id}`;
        cy.visitWithLogin(rescueUrl);
        cy.wait('@getLinode');

        // Wait for Linode to boot.
        cy.findByText('RUNNING').should('be.visible');

        // Open rescue dialog using action menu..
        ui.actionMenu
          .findByTitle(`Action menu for Linode ${linode.label}`)
          .should('be.visible')
          .click();

        ui.actionMenuItem.findByTitle('Rescue').should('be.visible').click();

        ui.dialog
          .findByTitle(`Rescue Linode ${linode.label}`)
          .should('be.visible')
          .within(() => {
            rebootInRescueMode();
          });

        // Check intercepted response and make sure UI responded correctly.
        cy.wait('@rebootLinodeRescueMode')
          .its('response.statusCode')
          .should('eq', 200);

        ui.toast.assertMessage('Linode rescue started.');
        cy.findByText('REBOOTING').should('be.visible');
      }
    );
  });

  /*
   * - Confirms UI error flow when user rescues a Linode that is provisioning.
   * - Confirms that API error message is displayed in the rescue dialog.
   */
  it('Cannot reboot a provisioning Linode into rescue mode', () => {
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
      status: 'provisioning',
    });

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockRebootLinodeIntoRescueModeError(mockLinode.id, 'Linode busy.').as(
      'rescueLinode'
    );

    cy.visitWithLogin(`/linodes/${mockLinode.id}?rescue=true`);
    ui.dialog
      .findByTitle(`Rescue Linode ${mockLinode.label}`)
      .should('be.visible')
      .within(() => {
        rebootInRescueMode();
        cy.wait('@rescueLinode');
        cy.findByText('Linode busy.').should('be.visible');
      });
  });
});
