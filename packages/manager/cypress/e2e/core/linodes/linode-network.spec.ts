import type { Linode } from '@linode/api-v4';

import { createLinodeRequestFactory } from '@src/factories';

import { authenticate } from 'support/api/authentication';
import { interceptGetLinode } from 'support/intercepts/linodes';
import { interceptUpdateIPAddress } from 'support/intercepts/networking';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { ui } from 'support/ui';

authenticate();
describe('linode networking', () => {
  before(() => {
    cleanUp('linodes');
  });

  /**
   * - Confirms flow for editing the RDNS of an IP address
   * - Confirms toast message upon editing RDNS
   */
  it('can edit the RDNS of an IP address', () => {
    const createLinodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
      backups_enabled: false,
      booted: false,
    });

    cy.defer(
      () => createTestLinode(createLinodeRequest),
      'creating Linode'
    ).then((linode: Linode) => {
      interceptGetLinode(linode.id).as('getLinode');

      cy.visitWithLogin(`linodes/${linode.id}/networking`);
      cy.wait(['@getLinode']);

      cy.findByLabelText('IPv4 Addresses')
        .should('be.visible')
        .within(() => {
          // confirm table headers
          cy.get('thead').findByText('Address').should('be.visible');
          cy.get('thead').findByText('Type').should('be.visible');
          cy.get('thead').findByText('Default Gateway').should('be.visible');
          cy.get('thead').findByText('Subnet Mask').should('be.visible');
          cy.get('thead').findByText('Reverse DNS').should('be.visible');
        });

      const linodeIPv4 = linode.ipv4.length > 0 ? linode.ipv4[0] : '';
      interceptUpdateIPAddress(linodeIPv4).as('updateIPAddress');

      // confirm row for Linode's (first) IPv4 exists and open up the RDNS drawer
      cy.get(`[data-qa-ip="${linodeIPv4}"]`)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText('IPv4 – Public').should('be.visible');

          // open up the edit RDNS drawer
          cy.get('[data-testid="action-menu-item-edit-rdns"]')
            .should('be.visible')
            .click();
        });

      // confirm RDNS drawer is visible
      ui.drawer
        .findByTitle('Edit Reverse DNS')
        .should('be.visible')
        .within(() => {
          cy.findByText('Leave this field blank to reset RDNS').should(
            'be.visible'
          );

          // click Save button
          cy.findByText('Save')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // confirm RDNS toast message
      cy.wait('@updateIPAddress');
      ui.toast.assertMessage(`Successfully updated RDNS for ${linodeIPv4}`);
    });
  });
});
