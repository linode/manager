import {
  linodeInterfaceFactoryPublic,
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
  mockCreateLinodeInterfaceError,
  mockGetLinodeDetails,
  mockGetLinodeFirewalls,
  mockGetLinodeInterfaces,
  mockGetLinodeIPAddresses,
} from 'support/intercepts/linodes';
import { mockUpdateIPAddress } from 'support/intercepts/networking';
import { mockGetVPCs } from 'support/intercepts/vpc';
import { ui } from 'support/ui';

import type { IPRange } from '@linode/api-v4';

describe('IP Addresses', () => {
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

    // confirm RDNS toast message
    ui.toast.assertMessage(`Successfully updated RDNS for ${linodeIPv4}`);
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

describe('Linode Interfaces', () => {
  beforeEach(() => {
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Linode Interfaces'],
      })
    );
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: true },
    });
  });

  it('allows the user to add a public network interface with a firewall', () => {
    const mockErrorMessage =
      "An interface must have exactly one of 'public', 'vpc' or 'vlan' properties defined";
    const linode = linodeFactory.build({ interface_generation: 'linode' });
    const firewalls = firewallFactory.buildList(3);
    const linodeInterface = linodeInterfaceFactoryPublic.build();

    const selectedFirewall = firewalls[1];

    mockGetLinodeDetails(linode.id, linode).as('getLinode');
    mockGetLinodeInterfaces(linode.id, { interfaces: [] }).as('getInterfaces');
    mockGetFirewalls(firewalls).as('getFirewalls');
    mockCreateLinodeInterfaceError(linode.id, mockErrorMessage).as(
      'createInterfaceError'
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

      // Try submitting the form
      ui.button.findByAttribute('type', 'submit').should('be.enabled').click();

      // Mock API error response when submitting without an interface type selected
      cy.findByText(mockErrorMessage).should('be.visible');

      // Select the public interface type
      cy.findByLabelText('Public').click();

      // Select a Firewall
      ui.autocomplete.findByLabel('Firewall').click();
      ui.autocompletePopper.findByTitle(selectedFirewall.label).click();

      mockGetLinodeInterfaces(linode.id, { interfaces: [linodeInterface] });
      mockCreateLinodeInterface(linode.id, linodeInterface).as(
        'createInterface'
      );

      ui.button.findByAttribute('type', 'submit').should('be.enabled').click();
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
    cy.findByText(linodeInterface.mac_address)
      .closest('tr')
      .within(() => {
        // Verify we fetch the interfaces firewalls and the label shows
        cy.wait('@getInterfaceFirewalls');
        cy.findByText(selectedFirewall.label).should('be.visible');

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
    mockGetLinodeInterfaces(linode.id, { interfaces: [] }).as('getInterfaces');
    mockGetFirewalls(firewalls).as('getFirewalls');
    mockGetVPCs(vpcs).as('getVPCs');
    mockCreateLinodeInterface(linode.id, linodeInterface).as('createInterface');
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
      ui.button.findByAttribute('type', 'submit').should('be.enabled').click();

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

      ui.button.findByAttribute('type', 'submit').should('be.enabled').click();
    });

    cy.wait('@createInterface').then((xhr) => {
      const requestPayload = xhr.request.body;

      // Confirm that request payload includes VPC interface only
      expect(requestPayload['public']).to.equal(null);
      expect(requestPayload['vpc']['subnet_id']).to.equal(selectedSubnet.id);
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
