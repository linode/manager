import { linodeFactory, ipAddressFactory } from '@src/factories';

import { authenticate } from 'support/api/authentication';
import {
  mockGetLinodeDetails,
  mockGetLinodeIPAddresses,
  mockGetLinodeFirewalls,
} from 'support/intercepts/linodes';
import { mockUpdateIPAddress } from 'support/intercepts/networking';
import { ui } from 'support/ui';

authenticate();
describe('linode networking', () => {
  /**
   * - Confirms the success toast message after editing RDNS
   * Note: this test is only to confirm the toast message and
   * intentionally doesn't edit the RDNS form
   */
  it('can edit the RDNS of an IP address', () => {
    const mockLinode = linodeFactory.build({});
    const linodeIPv4 = mockLinode.ipv4[0];
    const mockRDNS = `${linodeIPv4}.ip.linodeusercontent.com`;
    const ipAddress = ipAddressFactory.build({
      address: linodeIPv4,
      linode_id: mockLinode.id,
      rdns: mockRDNS,
    });

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeFirewalls(mockLinode.id, []).as('getLinodeFirewalls');
    mockGetLinodeIPAddresses(mockLinode.id, {
      ipv4: {
        public: [ipAddress],
        private: [],
        shared: [],
        reserved: [],
      },
    }).as('getLinodeIPAddresses');
    mockUpdateIPAddress(linodeIPv4, '').as('updateIPAddress');

    cy.visitWithLogin(`linodes/${mockLinode.id}/networking`);
    cy.wait(['@getLinode', '@getLinodeFirewalls', '@getLinodeIPAddresses']);

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

    // confirm row for Linode's (first) IPv4 exists and open up the RDNS drawer
    cy.get(`[data-qa-ip="${linodeIPv4}"]`)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('IPv4 – Public').should('be.visible');
        cy.findByText(mockRDNS).should('be.visible');

        // open up the edit RDNS drawer
        ui.button.findByTitle('Edit RDNS').should('be.visible').click();
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
        cy.findByText('Save').should('be.visible').should('be.enabled').click();
      });

    cy.wait(['@updateIPAddress']);

    // confirm RDNS toast message
    ui.toast.assertMessage(`Successfully updated RDNS for ${linodeIPv4}`);
  });
});
