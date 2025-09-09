import {
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVlan,
  linodeInterfaceFactoryVPC,
} from '@linode/utilities';
import { linodeFactory } from '@linode/utilities';
import {
  accountFactory,
  firewallDeviceFactory,
  firewallFactory,
  ipAddressFactory,
  subnetFactory,
  vpcFactory,
} from '@src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockAddFirewallDevice,
  mockGetFirewalls,
  mockGetLinodeInterfaceFirewalls,
} from 'support/intercepts/firewalls';
import {
  mockCreateLinodeInterface,
  mockGetLinodeDetails,
  mockGetLinodeFirewalls,
  mockGetLinodeInterface,
  mockGetLinodeInterfaces,
  mockGetLinodeIPAddresses,
} from 'support/intercepts/linodes';
import { mockUpdateIPAddress } from 'support/intercepts/networking';
import { mockGetVPC, mockGetVPCs } from 'support/intercepts/vpc';
import { ui } from 'support/ui';

import type { IPRange, LinodeIPsResponse } from '@linode/api-v4';

describe('IP Addresses', () => {
  // TODO M3-9775: Set mock linode interface type to legacy once Linode Interfaces is GA.
  const mockLinode = linodeFactory.build();
  const linodeIPv4 = mockLinode.ipv4[0];
  const mockRDNS = `${linodeIPv4}.ip.linodeusercontent.com`;
  const ipAddress = ipAddressFactory.build({
    address: linodeIPv4,
    linode_id: mockLinode.id,
    rdns: mockRDNS,
  });
  const _ipv6Range: IPRange = {
    prefix: 64,
    range: '2fff:db08:e003:1::',
    region: 'us-east',
    route_target: '2600:3c02::f03c:92ff:fe9d:0f25',
  };
  const ipv6Range = `${_ipv6Range.range}/${_ipv6Range.prefix}`;
  const ipv6Address = ipAddressFactory.build({
    address: mockLinode.ipv6 ?? '2600:3c00::f03c:92ff:fee2:6c40/64',
    gateway: 'fe80::1',
    linode_id: mockLinode.id,
    prefix: 64,
    subnet_mask: 'ffff:ffff:ffff:ffff::',
    type: 'ipv6',
  });

  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: false },
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeFirewalls(mockLinode.id, []).as('getLinodeFirewalls');
    mockGetLinodeIPAddresses(mockLinode.id, {
      ipv4: {
        private: [],
        public: [ipAddress],
        reserved: [],
        shared: [],
        vpc: [],
      },
      ipv6: {
        global: [_ipv6Range],
        link_local: ipv6Address,
        slaac: ipv6Address,
        vpc: [],
      },
    }).as('getLinodeIPAddresses');
    mockUpdateIPAddress(linodeIPv4, mockRDNS).as('updateIPAddress');

    cy.visitWithLogin(`linodes/${mockLinode.id}/networking`);
    cy.wait(['@getLinode', '@getLinodeFirewalls', '@getLinodeIPAddresses']);
  });

  /**
   * - Confirms the success toast message after editing RDNS
   */
  it('checks for the toast message upon editing an RDNS', () => {
    cy.findByLabelText('Linode IP Addresses')
      .should('be.visible')
      .within(() => {
        // confirm table headers
        cy.get('thead').findByText('Address').should('be.visible');
        cy.get('thead').findByText('Type').should('be.visible');
        cy.get('thead').findByText('Default Gateway').should('be.visible');
        cy.get('thead').findByText('Subnet Mask').should('be.visible');
        cy.get('thead').findByText('Reverse DNS').should('be.visible');
      });

    // confirm row for Linode's (first) IPv4 address exists and open up the RDNS drawer
    cy.get(`[data-qa-ip="${linodeIPv4}"]`)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Public – IPv4').should('be.visible');
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

        // click Save button - this test is only to confirm the toast message
        // and intentionally doesn't edit the RDNS form. Note - although we're using
        // mocks here, with actual data, I would get an error each time I tried to edit the RDNS
        cy.findByText('Save').should('be.visible').should('be.enabled').click();
      });

    cy.wait(['@updateIPAddress']);

    // TODO M3-9943 - Create Test for Toast Notifications that Persist
    // confirm RDNS toast message
    ui.toast.assertMessage(
      `Successfully updated RDNS for ${linodeIPv4}. RDNS entry updates may take up to one hour to show.`
    );
  });

  it('validates the action menu title (aria-label) for the IP address in the table row', () => {
    // Set the viewport to 1279px x 800px (width < 1280px) to ensure the Action menu is visible.
    cy.viewport(1279, 800);

    // Ensure the action menu has the correct aria-label for the IP address.
    cy.get(`[data-qa-ip="${linodeIPv4}"]`)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Public – IPv4').should('be.visible');
        ui.actionMenu
          .findByTitle(`Action menu for IP Address ${linodeIPv4}`)
          .should('be.visible');
      });

    // Ensure the action menu has the correct aria-label for the IP Range.
    cy.get(`[data-qa-ip="${ipv6Range}"]`)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Range – IPv6').should('be.visible');
        ui.actionMenu
          .findByTitle(`Action menu for IP Address ${_ipv6Range.range}`)
          .should('be.visible');
      });
  });
});

describe('Firewalls', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: false },
    });
  });

  it('allows the user to assign a Firewall from the Linode details page', () => {
    const linode = linodeFactory.build();
    const firewalls = firewallFactory.buildList(3);
    const firewallToAttach = firewalls[1];
    const firewallDevice = firewallDeviceFactory.build({
      entity: { id: linode.id, type: 'linode' },
    });

    mockGetLinodeDetails(linode.id, linode).as('getLinode');
    mockGetLinodeFirewalls(linode.id, []).as('getLinodeFirewalls');
    mockGetFirewalls(firewalls).as('getFirewalls');
    mockAddFirewallDevice(firewallToAttach.id, firewallDevice).as(
      'addFirewallDevice'
    );

    cy.visitWithLogin(`/linodes/${linode.id}/networking`);

    cy.wait(['@getLinode', '@getLinodeFirewalls']);

    cy.findByText('No Firewalls are assigned.').should('be.visible');

    ui.button
      .findByTitle('Add Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Firewalls should fetch when the drawer's contents are mounted
    cy.wait('@getFirewalls');

    mockGetLinodeFirewalls(linode.id, [firewallToAttach]).as(
      'getLinodeFirewalls'
    );

    ui.drawer.findByTitle('Add Firewall').within(() => {
      cy.findByLabelText('Firewall').should('be.visible').click();

      // Verify all firewalls show in the Select
      for (const firewall of firewalls) {
        ui.autocompletePopper
          .findByTitle(firewall.label)
          .should('be.visible')
          .should('be.enabled');
      }

      ui.autocompletePopper.findByTitle(firewallToAttach.label).click();

      ui.buttonGroup.find().within(() => {
        ui.button
          .findByTitle('Add Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    });

    // Verify the request has the correct payload
    cy.wait('@addFirewallDevice').then((xhr) => {
      const requestPayload = xhr.request.body;
      expect(requestPayload.id).to.equal(linode.id);
      expect(requestPayload.type).to.equal('linode');
    });

    ui.toast.assertMessage('Successfully assigned Firewall');

    // The Linode's firewalls list should be invalidated after the new firewall device was added
    cy.wait('@getLinodeFirewalls');

    // Verify the firewall shows up in the table
    cy.findAllByText(firewallToAttach.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Unassign').should('be.visible').should('be.enabled');
      });

    // The "Add Firewall" button should now be disabled beause the Linode has a firewall attached
    ui.button
      .findByTitle('Add Firewall')
      .should('be.visible')
      .should('be.disabled');
  });
});

describe('Linode Interfaces enabled', () => {
  beforeEach(() => {
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Linodes', 'Linode Interfaces'],
      })
    );
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: true },
    });
  });

  describe('Linode with legacy config-based interfaces', () => {
    const mockLinode = linodeFactory.build({
      interface_generation: 'legacy_config',
    });

    const mockLinodeIPv4 = ipAddressFactory.build({
      linode_id: mockLinode.id,
      public: true,
      type: 'ipv4',
      region: mockLinode.region,
      interface_id: null,
    });

    const mockLinodeIPs: LinodeIPsResponse = {
      ipv4: {
        public: [mockLinodeIPv4],
        private: [],
        reserved: [],
        shared: [],
        vpc: [],
      },
    };

    beforeEach(() => {
      mockGetLinodeDetails(mockLinode.id, mockLinode);
      mockGetLinodeFirewalls(mockLinode.id, []);
      mockGetLinodeIPAddresses(mockLinode.id, mockLinodeIPs);
    });

    /*
     * - Confirms network tab Firewall table is present for Linodes with config-based interfaces.
     * - Confirms that "Add Firewall" button is present and enabled for Linodes with config-based interfaces.
     */
    it('shows the Firewall table for Linodes with config-based interfaces', () => {
      cy.visitWithLogin(`/linodes/${mockLinode.id}/networking`);

      ui.button
        .findByTitle('Add Firewall')
        .should('be.visible')
        .should('be.enabled');

      cy.findByLabelText('Linode Firewalls')
        .should('be.visible')
        .within(() => {
          cy.findByText('No Firewalls are assigned.').should('be.visible');
        });
    });

    /*
     * - Confirms that network tab IP Addresses table is present for Linodes with config-based interfaces.
     * - Confirms that IP address add and delete buttons are present for Linodes with config-based interfaces.
     */
    it('shows the IP address add and remove buttons for Linodes with config-based interfaces', () => {
      cy.visitWithLogin(`/linodes/${mockLinode.id}/networking`);

      ui.button
        .findByTitle('Add an IP Address')
        .should('be.visible')
        .should('be.enabled');

      cy.findByLabelText('Linode IP Addresses').should('be.visible');
      cy.findByText(mockLinodeIPv4.address)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText('Public – IPv4').should('be.visible');
          ui.button.findByTitle('Delete').should('be.visible');
        });
    });
  });

  describe('Linode with Linode-based interfaces', () => {
    const mockLinode = linodeFactory.build({
      interface_generation: 'linode',
    });

    const mockLinodeIPv4 = ipAddressFactory.build({
      linode_id: mockLinode.id,
      public: true,
      type: 'ipv4',
      region: mockLinode.region,
      interface_id: null,
    });

    const mockLinodeIPs: LinodeIPsResponse = {
      ipv4: {
        public: [mockLinodeIPv4],
        private: [],
        reserved: [],
        shared: [],
        vpc: [],
      },
    };

    const mockFirewalls = firewallFactory.buildList(3);

    beforeEach(() => {
      mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
      mockGetLinodeIPAddresses(mockLinode.id, mockLinodeIPs).as('getLinodeIPs');
      mockGetLinodeInterfaces(mockLinode.id, { interfaces: [] }).as(
        'getInterfaces'
      );
    });

    /*
     * - Confirms that network tab Firewall table is absent for Linodes using new Linode-based interfaces.
     * - Confirms that IP address add and delete buttons are absent for Linodes using new Linode-based interfaces.
     */
    it('hides Firewall table and IP address buttons', () => {
      cy.visitWithLogin(`/linodes/${mockLinode.id}/networking`);

      // Confirm Firewalls section is absent
      cy.findByLabelText('Linode Firewalls').should('not.exist');
      cy.findByText('Add Firewall').should('not.exist');

      // Confirm add IP and delete IP buttons are missing from IP address section
      cy.findByLabelText('Linode IP Addresses').should('be.visible');
      cy.findByText('Add an IP Address').should('not.exist');
      cy.findByText(mockLinodeIPv4.address)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText('Public – IPv4').should('be.visible');
          cy.findByText('Delete').should('not.exist');
        });
    });

    it('confirms the Network Interfaces table functions as expected', () => {
      const publicInterface = linodeInterfaceFactoryPublic.build();
      mockGetLinodeInterfaces(mockLinode.id, {
        interfaces: [publicInterface],
      }).as('getInterfaces');

      cy.visitWithLogin(`/linodes/${mockLinode.id}/networking`);

      ui.button
        .findByTitle('Add Network Interface')
        .should('be.visible')
        .should('be.enabled');
      ui.button
        .findByTitle('Interface Settings')
        .should('be.visible')
        .should('be.enabled');

      // Confirm table heading row
      cy.findByLabelText('Linode Interfaces')
        .should('be.visible')
        .within(() => {
          cy.findByText('Type').should('be.visible');
          cy.findByText('ID').should('be.visible');
          cy.findByText('MAC Address').should('be.visible');
          cy.findByText('IP Addresses').should('be.visible');
          cy.findByText('Version').should('be.visible');
          cy.findByText('Firewall').should('be.visible');
          cy.findByText('Updated').should('be.visible');
          cy.findByText('Created').should('be.visible');
        });

      // Confirm interface row's action menu
      cy.findByText(publicInterface.mac_address)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          ui.actionMenu
            .findByTitle(
              `Action menu for Public Interface (${publicInterface.id})`
            )
            .should('be.visible')
            .should('be.enabled')
            .click();

          ui.actionMenuItem
            .findByTitle('Details')
            .should('be.visible')
            .should('be.enabled');
          ui.actionMenuItem
            .findByTitle('Edit')
            .should('be.visible')
            .should('be.enabled');
          ui.actionMenuItem
            .findByTitle('Delete')
            .should('be.visible')
            .should('be.enabled');
        });
    });

    describe('Adding a Linode Interface', () => {
      it('allows the user to add a VLAN interface', () => {
        const mockLinodeInterface = linodeInterfaceFactoryVlan.build();

        mockGetFirewalls(mockFirewalls).as('getFirewalls');
        mockCreateLinodeInterface(mockLinode.id, mockLinodeInterface).as(
          'createInterface'
        );
        mockGetLinodeInterfaceFirewalls(
          mockLinode.id,
          mockLinodeInterface.id,
          []
        ).as('getInterfaceFirewalls');

        cy.visitWithLogin(`/linodes/${mockLinode.id}/networking`);

        cy.wait(['@getLinode', '@getInterfaces']);

        ui.button.findByTitle('Add Network Interface').scrollIntoView().click();

        ui.drawer.findByTitle('Add Network Interface').within(() => {
          // Verify firewalls fetch
          cy.wait('@getFirewalls');

          // Try submitting the form
          ui.button
            .findByAttribute('type', 'submit')
            .should('be.enabled')
            .click();

          // Verify a validation error shows
          cy.findByText('You must selected an Interface type.').should(
            'be.visible'
          );

          // Select the public interface type
          cy.findByLabelText('VLAN').click();

          // Verify a validation error goes away
          cy.findByText('You must selected an Interface type.').should(
            'not.exist'
          );

          ui.button
            .findByAttribute('type', 'submit')
            .should('be.enabled')
            .click();

          // Verify an error shows because a VLAN was not selected nor created
          cy.findByText('VLAN label is required.').should('be.visible');

          // Verify VLAN label and IPAM selects
          // Type label for VLAN
          ui.autocomplete
            .findByLabel('VLAN')
            .should('be.visible')
            .click()
            .type('testVLAN');

          cy.findByText('IPAM Address').should('be.visible').click();
          cy.findByText(
            'IPAM address must use IP/netmask format, e.g. 192.0.2.0/24.'
          ).should('be.visible');

          // Verify VLAN error disappears
          cy.findByText('VLAN label is required.').should('not.exist');

          // Verify firewall select doees not appear
          cy.findByText('Firewall').should('not.exist');

          mockGetLinodeInterfaces(mockLinode.id, {
            interfaces: [mockLinodeInterface],
          });

          mockGetLinodeInterfaces(mockLinode.id, {
            interfaces: [mockLinodeInterface],
          });

          ui.button
            .findByAttribute('type', 'submit')
            .should('be.enabled')
            .click();
        });

        cy.wait('@createInterface').then((xhr) => {
          const requestPayload = xhr.request.body;

          // Confirm that request payload includes a VLAN interface only
          expect(requestPayload['public']).to.equal(null);
          expect(requestPayload['vpc']).to.equal(null);
          expect(requestPayload['vlan']).to.be.an('object');
        });

        ui.toast.assertMessage('Successfully added network interface.');

        // Verify the interface row shows upon creation
        cy.findByText(mockLinodeInterface.mac_address)
          .closest('tr')
          .within(() => {
            // Verify we fetch the interfaces firewalls and the label shows
            cy.wait('@getInterfaceFirewalls');
            cy.findByText('None').should('be.visible');

            // Verify the interface type shows
            cy.findByText('VLAN').should('be.visible');
          });
      });

      it('allows the user to add a public network interface with a firewall', () => {
        const mockLinodeInterface = linodeInterfaceFactoryPublic.build();
        const selectedMockFirewall = mockFirewalls[1];

        mockGetFirewalls(mockFirewalls).as('getFirewalls');
        mockCreateLinodeInterface(mockLinode.id, mockLinodeInterface).as(
          'createInterface'
        );
        mockGetLinodeInterfaceFirewalls(mockLinode.id, mockLinodeInterface.id, [
          selectedMockFirewall,
        ]).as('getInterfaceFirewalls');

        cy.visitWithLogin(`/linodes/${mockLinode.id}/networking`);

        cy.wait(['@getLinode', '@getInterfaces']);

        ui.button.findByTitle('Add Network Interface').scrollIntoView().click();

        ui.drawer.findByTitle('Add Network Interface').within(() => {
          // Verify firewalls fetch
          cy.wait('@getFirewalls');

          // Try submitting the form
          ui.button
            .findByAttribute('type', 'submit')
            .should('be.enabled')
            .click();

          // Verify a validation error shows
          cy.findByText('You must selected an Interface type.').should(
            'be.visible'
          );

          // Select the public interface type
          cy.findByLabelText('Public').click();

          // Verify a validation error goes away
          cy.findByText('You must selected an Interface type.').should(
            'not.exist'
          );

          // Select a Firewall
          ui.autocomplete.findByLabel('Firewall').click();
          ui.autocompletePopper.findByTitle(selectedMockFirewall.label).click();

          mockGetLinodeInterfaces(mockLinode.id, {
            interfaces: [mockLinodeInterface],
          });

          ui.button
            .findByAttribute('type', 'submit')
            .should('be.enabled')
            .click();
        });

        cy.wait('@createInterface').then((xhr) => {
          const requestPayload = xhr.request.body;

          // Confirm that request payload includes a Public interface only
          expect(requestPayload['public']).to.be.an('object');
          expect(requestPayload['vpc']).to.equal(null);
          expect(requestPayload['vlan']).to.equal(null);
        });

        ui.toast.assertMessage('Successfully added network interface.');

        // Verify the interface row shows upon creation
        cy.findByText(mockLinodeInterface.mac_address)
          .closest('tr')
          .within(() => {
            // Verify we fetch the interfaces firewalls and the label shows
            cy.wait('@getInterfaceFirewalls');
            cy.findByText(selectedMockFirewall.label).should('be.visible');

            // Verify the interface type shows
            cy.findByText('Public').should('be.visible');
          });
      });

      it('allows the user to add a VPC network interface with a firewall', () => {
        const linode = linodeFactory.build({ interface_generation: 'linode' });
        const firewalls = firewallFactory.buildList(3);
        const subnets = subnetFactory.buildList(3);
        const vpcs = vpcFactory.buildList(3, { subnets });
        const linodeInterface = linodeInterfaceFactoryVPC.build();

        const selectedFirewall = firewalls[1];
        const selectedVPC = vpcs[1];
        const selectedSubnet = selectedVPC.subnets[0];

        mockGetLinodeDetails(linode.id, linode).as('getLinode');
        mockGetLinodeInterfaces(linode.id, { interfaces: [] }).as(
          'getInterfaces'
        );
        mockGetFirewalls(firewalls).as('getFirewalls');
        mockGetVPCs(vpcs).as('getVPCs');
        mockCreateLinodeInterface(linode.id, linodeInterface).as(
          'createInterface'
        );
        mockGetLinodeInterfaceFirewalls(linode.id, linodeInterface.id, [
          selectedFirewall,
        ]).as('getInterfaceFirewalls');

        cy.visitWithLogin(`/linodes/${linode.id}/networking`);

        cy.wait(['@getLinode', '@getInterfaces']);

        ui.button.findByTitle('Add Network Interface').scrollIntoView().click();

        ui.drawer.findByTitle('Add Network Interface').within(() => {
          // Verify firewalls fetch
          cy.wait('@getFirewalls');

          cy.findByLabelText('VPC').click();

          // Verify VPCs fetch
          cy.wait('@getVPCs');

          // Select a VPC
          ui.autocomplete.findByLabel('VPC').click();
          ui.autocompletePopper.findByTitle(selectedVPC.label).click();

          // Select a Firewall
          ui.autocomplete.findByLabel('Firewall').click();
          ui.autocompletePopper.findByTitle(selectedFirewall.label).click();

          // Submit the form
          ui.button
            .findByAttribute('type', 'submit')
            .should('be.enabled')
            .click();

          // Verify an error shows because a subnet is not selected
          cy.findByText('Subnet is required.').should('be.visible');

          // Select a Subnet
          ui.autocomplete.findByLabel('Subnet').click();
          ui.autocompletePopper
            .findByTitle(`${selectedSubnet.label} (${selectedSubnet.ipv4})`)
            .click();

          // Verify the error goes away
          cy.findByText('Subnet is required.').should('not.exist');

          mockGetLinodeInterfaces(linode.id, { interfaces: [linodeInterface] });

          ui.button
            .findByAttribute('type', 'submit')
            .should('be.enabled')
            .click();
        });

        cy.wait('@createInterface').then((xhr) => {
          const requestPayload = xhr.request.body;

          // Confirm that request payload includes VPC interface only
          expect(requestPayload['public']).to.equal(null);
          expect(requestPayload['vpc']['subnet_id']).to.equal(
            selectedSubnet.id
          );
          expect(requestPayload['vlan']).to.equal(null);
        });

        ui.toast.assertMessage('Successfully added network interface.');

        // Verify the interface row shows upon creation
        cy.findByText(linodeInterface.mac_address)
          .closest('tr')
          .within(() => {
            // Verify we fetch the interfaces firewalls and the label shows
            cy.wait('@getInterfaceFirewalls');
            cy.findByText(selectedFirewall.label).should('be.visible');

            // Verify the interface type shows
            cy.findByText('VPC').should('be.visible');
          });
      });
    });

    describe('Interface Details drawer', () => {
      it('confirms the details drawer for a public interface', () => {
        const linodeInterface = linodeInterfaceFactoryPublic.build({
          public: {
            ipv6: {
              ranges: [
                {
                  range: '2600:3c06:e001:149::/64',
                  route_target: null,
                },
                {
                  range: '2600:3c06:e001:149::/56',
                  route_target: null,
                },
              ],
              shared: [],
              slaac: [
                { address: '2600:3c06::2000:13ff:fe6b:31b0', prefix: '64' },
              ],
            },
          },
        });
        mockGetLinodeInterfaces(mockLinode.id, {
          interfaces: [linodeInterface],
        }).as('getInterfaces');
        mockGetLinodeInterface(
          mockLinode.id,
          linodeInterface.id,
          linodeInterface
        );

        cy.visitWithLogin(`/linodes/${mockLinode.id}/networking`);

        // Open up the detail drawer
        cy.findByText(linodeInterface.mac_address)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            ui.actionMenu
              .findByTitle(
                `Action menu for Public Interface (${linodeInterface.id})`
              )
              .should('be.visible')
              .should('be.enabled')
              .click();

            ui.actionMenuItem
              .findByTitle('Details')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm drawer content
        ui.drawer
          .findByTitle(`Network Interface Details (ID: ${linodeInterface.id})`)
          .within(() => {
            cy.findByText('IPv4 Default Route').should('be.visible');
            cy.findByText('IPv6 Default Route').should('be.visible');
            cy.findByText('Type').should('be.visible');
            cy.findByText('Public').should('be.visible');
            cy.findByText('IPv4 Addresses').should('be.visible');
            cy.findByText(
              `${linodeInterface.public?.ipv4.addresses[0].address} (Primary)`
            ).should('be.visible');
            cy.findByText('2600:3c06::2000:13ff:fe6b:31b0 (SLAAC)').should(
              'be.visible'
            );
            cy.findByText('2600:3c06:e001:149::/64 (Range)').should(
              'be.visible'
            );
            cy.findByText('2600:3c06:e001:149::/56 (Range)').should(
              'be.visible'
            );
          });
      });

      it('confirms the details drawer for a VLAN interface', () => {
        const linodeInterface = linodeInterfaceFactoryVlan.build();
        mockGetLinodeInterfaces(mockLinode.id, {
          interfaces: [linodeInterface],
        }).as('getInterfaces');
        mockGetLinodeInterface(
          mockLinode.id,
          linodeInterface.id,
          linodeInterface
        );

        cy.visitWithLogin(`/linodes/${mockLinode.id}/networking`);

        // Open up the detail drawer
        cy.findByText(linodeInterface.mac_address)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            ui.actionMenu
              .findByTitle(
                `Action menu for VLAN Interface (${linodeInterface.id})`
              )
              .should('be.visible')
              .should('be.enabled')
              .click();

            ui.actionMenuItem
              .findByTitle('Details')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm drawer content
        ui.drawer
          .findByTitle(`Network Interface Details (ID: ${linodeInterface.id})`)
          .within(() => {
            cy.findByText('Type').should('be.visible');
            cy.findByText('VLAN').should('be.visible');
            cy.findByText('VLAN Label').should('be.visible');
            cy.findByText(`${linodeInterface.vlan?.vlan_label}`).should(
              'be.visible'
            );
            cy.findByText('IPAM Address').should('be.visible');
            cy.findByText(`${linodeInterface.vlan?.ipam_address}`).should(
              'be.visible'
            );
          });
      });

      it('confirms the details drawer for a VPC interface', () => {
        const linodeInterface = linodeInterfaceFactoryVPC.build();
        const mockSubnet = subnetFactory.build({
          id: linodeInterface.vpc?.subnet_id,
        });
        const mockVPC = vpcFactory.build({
          id: linodeInterface.vpc?.vpc_id,
          subnets: [mockSubnet],
        });

        mockGetVPC(mockVPC);
        mockGetLinodeInterfaces(mockLinode.id, {
          interfaces: [linodeInterface],
        }).as('getInterfaces');
        mockGetLinodeInterface(
          mockLinode.id,
          linodeInterface.id,
          linodeInterface
        );

        cy.visitWithLogin(`/linodes/${mockLinode.id}/networking`);

        // Open up the details drawer
        cy.findByText(linodeInterface.mac_address)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            ui.actionMenu
              .findByTitle(
                `Action menu for VPC Interface (${linodeInterface.id})`
              )
              .should('be.visible')
              .should('be.enabled')
              .click();

            ui.actionMenuItem
              .findByTitle('Details')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm drawer content
        ui.drawer
          .findByTitle(`Network Interface Details (ID: ${linodeInterface.id})`)
          .within(() => {
            cy.findByText('IPv4 Default Route').should('be.visible');
            cy.findByText('Type').should('be.visible');
            cy.findByText('VPC').should('be.visible');
            cy.findByText('VPC Label').should('be.visible');
            cy.findByText(`${mockVPC.label}`).should('be.visible');
            cy.findByText('Subnet Label').should('be.visible');
            cy.findByText(`${mockSubnet.label}`).should('be.visible');
            cy.findByText('IPv4 Addresses').should('be.visible');
          });
      });
    });
  });
});
