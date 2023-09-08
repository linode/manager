import { createLinode, Linode } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import {
  interceptGetLinodeDetails,
  interceptRebootLinodeIntoRescueMode,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { createAndBootLinode } from './linode-utils';

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
  /*
   * - Creates a Linode, waits for it to boot, and reboots it into rescue mode.
   * - Confirms that rescue mode API requests succeed.
   * - Confirms that Linode status changes to "Rebooting".
   * - Confirms that toast appears confirming successful reboot into rescue mode.
   */
  it('Can reboot a Linode into rescue mode', () => {
    cy.defer(createAndBootLinode(), 'creating and booting Linode').then(
      (linode: Linode) => {
        // mock 200 response
        interceptGetLinodeDetails(linode.id).as('getLinode');
        interceptRebootLinodeIntoRescueMode(linode.id).as(
          'rebootLinodeRescueMode'
        );

        const rescueUrl = `/linodes/${linode.id}/?rescue=true`;
        cy.visitWithLogin(rescueUrl);
        cy.wait('@getLinode');

        ui.dialog
          .findByTitle(`Rescue Linode ${linode.label}`)
          .should('be.visible')
          .within(() => {
            rebootInRescueMode();
          });

        // Check mocked response and make sure UI responded correctly.
        cy.wait('@rebootLinodeRescueMode')
          .its('response.statusCode')
          .should('eq', 200);

        ui.toast.assertMessage('Linode rescue started.');
        cy.findByText('REBOOTING').should('be.visible');
      }
    );
  });

  /*
   * - Creates a Linode and immediately attempts to reboot it into rescue mode.
   * - Confirms that an error message appears in the UI explaining that the Linode is busy.
   */
  it('Cannot reboot a provisioning Linode into rescue mode', () => {
    const linodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    cy.defer(createLinode(linodeRequest), 'creating Linode').then(
      (linode: Linode) => {
        interceptGetLinodeDetails(linode.id).as('getLinode');
        interceptRebootLinodeIntoRescueMode(linode.id).as(
          'rebootLinodeRescueMode'
        );

        const rescueUrl = `/linodes/${linode.id}?rescue=true`;

        cy.visitWithLogin(rescueUrl);
        cy.wait('@getLinode');

        ui.dialog
          .findByTitle(`Rescue Linode ${linode.label}`)
          .should('be.visible')
          .within(() => {
            rebootInRescueMode();

            // Wait for API request and confirm that error message appears in dialog.
            cy.wait('@rebootLinodeRescueMode')
              .its('response.statusCode')
              .should('eq', 400);

            cy.findByText('Linode busy.').should('be.visible');
          });
      }
    );
  });
});
