import type { Linode } from '@linode/api-v4';
import { createLinodeRequestFactory, linodeFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import {
  interceptGetLinodeDetails,
  interceptRebootLinodeIntoRescueMode,
  mockGetLinodeDetails,
  mockGetLinodeDisks,
  mockGetLinodeVolumes,
  mockRebootLinodeIntoRescueModeError,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

// Submits the Rescue Linode dialog, initiating reboot into rescue mode.
const rebootInRescueMode = () => {
  ui.button
    .findByTitle('Reboot into Rescue Mode')
    .should('be.visible')
    .should('be.enabled')
    .should('have.attr', 'data-qa-form-data-loading', 'false')
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
    cy.tag('method:e2e');
    const linodePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to interact with it shortly after booting up when the
    // Linode is attached to a Cloud Firewall.
    cy.defer(
      () =>
        createTestLinode(linodePayload, { securityMethod: 'vlan_no_internet' }),
      'creating Linode'
    ).then((linode: Linode) => {
      interceptGetLinodeDetails(linode.id).as('getLinode');
      interceptRebootLinodeIntoRescueMode(linode.id).as(
        'rebootLinodeRescueMode'
      );

      const rescueUrl = `/linodes/${linode.id}`;
      cy.visitWithLogin(rescueUrl);
      cy.wait('@getLinode');

      // Wait for Linode to boot.
      cy.findByText('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );

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
    });
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
    mockGetLinodeDisks(mockLinode.id, []).as('getLinodeDisks');
    mockGetLinodeVolumes(mockLinode.id, []).as('getLinodeVolumes');

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
