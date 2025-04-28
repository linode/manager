/**
 * @file Integration tests for adding devices to firewalls
 */

import {
  linodeFactory,
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVlan,
  linodeInterfaceFactoryVPC,
} from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockAddFirewallDevice,
  mockGetFirewall,
  mockGetFirewallDevices,
  mockGetFirewalls,
} from 'support/intercepts/firewalls';
import { mockGetLinodeInterfaces } from 'support/intercepts/linodes';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';

import {
  accountFactory,
  firewallDeviceFactory,
  firewallFactory,
} from 'src/factories';

describe('Can add Linode and Linode Interface devices to firewalls', () => {
  beforeEach(() => {
    // TODO M3-9775 - Remove mock once `linodeInterfaces` feature flag is removed.
    mockAppendFeatureFlags({
      linodeInterfaces: {
        enabled: true,
      },
    });
    // TODO M3-9775 - Remove mock once all accounts get 'Linode Interfaces' capability.
    mockGetAccount(
      accountFactory.build({
        capabilities: [
          'Cloud Firewall',
          'Linode Interfaces',
          'Linodes',
          'NodeBalancers',
        ],
      })
    );
  });

  /*
   * - Confirms Linodes using both legacy and Linode interfaces show up in the firewall select
   * - Confirms Linodes using both types of interfaces can be assigned to the firewall
   * - Confirm interface selects do not appear if Linode only has one eligible interface
   * - Confirms toasts appear if firewall successfully assigned
   * - Confirms new column in Linode devices landing table
   */
  it('can assign Linodes with legacy and new interfaces to a firewall', () => {
    const mockFirewall = firewallFactory.build({ entities: [] });
    const mockConfigInterfaceLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });
    const mockNewInterfaceLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      interface_generation: 'linode',
    });

    const mockLinodeInterface = linodeInterfaceFactoryPublic.build();
    const mockLinodeDevice = firewallDeviceFactory.build({
      entity: {
        id: randomNumber(),
        label: mockConfigInterfaceLinode.label,
      },
    });
    const mockInterfaceDevice = firewallDeviceFactory.build({
      entity: {
        type: 'interface',
        id: mockLinodeInterface.id,
        url: `/v4/linode/instances/${mockNewInterfaceLinode.id}/interfaces/${mockLinodeInterface.id}`,
      },
    });

    mockGetFirewall(mockFirewall.id, mockFirewall);
    mockGetFirewalls([mockFirewall]);
    mockGetFirewallDevices(mockFirewall.id, []);
    mockGetLinodes([mockConfigInterfaceLinode, mockNewInterfaceLinode]);
    mockGetLinodeInterfaces(mockNewInterfaceLinode.id, {
      interfaces: [mockLinodeInterface],
    });
    cy.visitWithLogin(`/firewalls/${mockFirewall.id}/linodes`);

    // confirm firewall has no devices yet
    // confirm Network Interface column exists
    cy.findByLabelText('List of Linodes attached to this firewall')
      .should('be.visible')
      .within(() => {
        cy.get('thead').findByText('Linode').should('be.visible');
        cy.get('thead').findByText('Network Interface').should('be.visible');
        cy.findByText('No data to display.').should('be.visible');
      });

    ui.button
      .findByTitle('Add Linodes to Firewall')
      .should('be.visible')
      .click();

    // Confirm Linode using legacy interfaces can be selected
    ui.drawer
      .findByTitle(`Add Linode to Firewall: ${mockFirewall.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Linodes').should('be.visible').click();

        ui.autocompletePopper
          .findByTitle(mockConfigInterfaceLinode.label)
          .should('be.visible')
          .click();

        ui.button
          .findByAttribute('aria-label', 'Close')
          .should('be.visible')
          .click();
        mockAddFirewallDevice(mockFirewall.id, mockLinodeDevice);

        ui.button
          .findByTitle('Add')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // confirm toast appears after adding Linode to firewall
    ui.toast.assertMessage(
      `Linode ${mockConfigInterfaceLinode.label} successfully added.`
    );

    // confirm Linode device shows up in the table row
    cy.findByLabelText(mockConfigInterfaceLinode.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Configuration Profile Interface');
      });

    ui.button
      .findByTitle('Add Linodes to Firewall')
      .should('be.visible')
      .click();

    // confirm Linode using new interfaces can be selected
    // Adding these two devices separately due to mocking - so that the same mock data isn't returned twice due to using the POST device endpoint twice
    ui.drawer
      .findByTitle(`Add Linode to Firewall: ${mockFirewall.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Linodes').should('be.visible').click();

        // Confirm Linode using Linode interfaces can be selected
        ui.autocompletePopper
          .findByTitle(mockNewInterfaceLinode.label)
          .should('be.visible')
          .click();

        ui.button
          .findByAttribute('aria-label', 'Close')
          .should('be.visible')
          .click();

        // confirm Interface select doesn't appear for mockNewInterfaceLinode
        cy.findByText(`${mockNewInterfaceLinode.label} Interface`).should(
          'not.exist'
        );

        mockAddFirewallDevice(mockFirewall.id, mockInterfaceDevice);

        ui.button
          .findByTitle('Add')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm toast for assigning an interface device appears
    ui.toast.assertMessage(
      `Interface (ID ${mockLinodeInterface.id}) from Linode ${mockNewInterfaceLinode.label} successfully added.`
    );

    // confirm Interface device shows up in the table row
    cy.findByLabelText(mockNewInterfaceLinode.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(`Linode Interface (ID: ${mockLinodeInterface.id})`);
      });
  });

  /**
   * - Confirms if selected Linode have more than one eligible interface to assign, an additional interface select appear
   * - Confirms if selected Linode has multiple interfaces but only one eligible interface to assign, an additional interface select does not appear
   * - Confirms toasts appear if firewall successfully assigned
   */
  it('must select interfaces for Linodes with more than one eligible Linode Interface', () => {
    const mockFirewall = firewallFactory.build({ entities: [] });
    const mockMultipleEligibleInterfacesLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      interface_generation: 'linode',
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      interface_generation: 'linode',
    });

    const mockPublicInterface1 = linodeInterfaceFactoryPublic.build({ id: 1 });
    const mockPublicInterface2 = linodeInterfaceFactoryPublic.build({ id: 2 });
    const mockVPCInterface = linodeInterfaceFactoryVPC.build({ id: 3 });
    const mockVlanInterface = linodeInterfaceFactoryVlan.build({ id: 4 });

    const mockInterfaceDevice = firewallDeviceFactory.build({
      entity: {
        type: 'interface',
        id: mockVPCInterface.id,
        url: `/v4/linode/instances/${mockMultipleEligibleInterfacesLinode.id}/interfaces/${mockVPCInterface.id}`,
      },
    });

    mockGetFirewall(mockFirewall.id, mockFirewall);
    mockGetFirewalls([mockFirewall]);
    mockGetFirewallDevices(mockFirewall.id, []);
    mockGetLinodes([mockMultipleEligibleInterfacesLinode, mockLinode]);
    mockGetLinodeInterfaces(mockMultipleEligibleInterfacesLinode.id, {
      interfaces: [mockPublicInterface1, mockVPCInterface],
    });
    mockGetLinodeInterfaces(mockLinode.id, {
      interfaces: [mockPublicInterface2, mockVlanInterface],
    });
    cy.visitWithLogin(`/firewalls/${mockFirewall.id}/linodes`);

    ui.button
      .findByTitle('Add Linodes to Firewall')
      .should('be.visible')
      .click();

    // Confirm Linode using legacy interfaces can be selected
    ui.drawer
      .findByTitle(`Add Linode to Firewall: ${mockFirewall.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Linodes').should('be.visible').click();

        ui.autocompletePopper
          .findByTitle(mockLinode.label)
          .should('be.visible')
          .click();

        ui.button
          .findByAttribute('aria-label', 'Close')
          .should('be.visible')
          .click();

        // confirm Interface select doesn't appear for mockLinode - only one eligible interface
        cy.findByText(`${mockLinode.label} Interface`).should('not.exist');

        cy.findByLabelText('Linodes').should('be.visible').click();

        // deselect mockLinode
        ui.autocompletePopper
          .findByTitle(mockLinode.label)
          .should('be.visible')
          .click();

        // select mockMultipleEligibleInterfacesLinode
        ui.autocompletePopper
          .findByTitle(mockMultipleEligibleInterfacesLinode.label)
          .should('be.visible')
          .click();
        ui.button
          .findByAttribute('aria-label', 'Close')
          .should('be.visible')
          .click();

        // confirm Interface select appears for mockMultipleEligibleInterfacesLinode and select interface
        ui.autocomplete
          .findByLabel(
            `${mockMultipleEligibleInterfacesLinode.label} Interface`
          )
          .should('be.visible')
          .click();
        ui.autocompletePopper
          .findByTitle(`VPC Interface (ID: ${mockVPCInterface.id})`)
          .should('be.visible')
          .click();
        mockAddFirewallDevice(mockFirewall.id, mockInterfaceDevice);

        ui.button
          .findByTitle('Add')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm toast for assigning an interface device appears
    ui.toast.assertMessage(
      `Interface (ID ${mockVPCInterface.id}) from Linode ${mockMultipleEligibleInterfacesLinode.label} successfully added.`
    );

    // confirm Interface device shows up in the table row
    cy.findByLabelText(mockMultipleEligibleInterfacesLinode.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(`Linode Interface (ID: ${mockVPCInterface.id})`);
      });
  });

  /**
   * - Confirms filtering in Linode Select done correctly:
   * - Confirms a Linode using legacy interfaces but already assigned to a firewall will not appear in the firewall select
   * - Confirms a Linode using new interfaces but with no interfaces will not appear in the firewall select
   * - Confirms a Linode using new interfaces but with only a VLAN interface will not appear in the firewall select
   * - Confirms a Linode using new interfaces but with an already assigned interface will not appear in the firewall select *
   * (* this may change if multi firewall support is added - see M3-9829)
   */
  it('only shows eligible Linodes to be assigned', () => {
    // Set up all mocks
    const mockPublicInterface = linodeInterfaceFactoryPublic.build({ id: 1 });
    const mockVlanInterface = linodeInterfaceFactoryVlan.build({ id: 4 });
    const mockLegacyLinode = linodeFactory.build();
    const mockNoLIInterfacesLinode = linodeFactory.build({
      interface_generation: 'linode',
    });
    const mockOnlyVlanLILinode = linodeFactory.build({
      interface_generation: 'linode',
    });
    const mockAlreadyAssignedLILinode = linodeFactory.build({
      interface_generation: 'linode',
    });

    const mockLinodeDevice = firewallDeviceFactory.build({
      entity: {
        label: mockLegacyLinode.label,
        type: 'linode',
        id: mockLegacyLinode.id,
        url: `/v4/linode/instances/${mockLegacyLinode.id}`,
      },
    });
    const mockInterfaceDevice = firewallDeviceFactory.build({
      entity: {
        type: 'interface',
        id: mockPublicInterface.id,
        url: `/v4/linode/instances/${mockAlreadyAssignedLILinode.id}/interfaces/${mockPublicInterface.id}`,
      },
    });

    const mockFirewall = firewallFactory.build({
      entities: [mockLinodeDevice.entity, mockInterfaceDevice.entity],
    });

    mockGetFirewall(mockFirewall.id, mockFirewall);
    mockGetFirewalls([mockFirewall]);
    mockGetFirewallDevices(mockFirewall.id, [
      mockLinodeDevice,
      mockInterfaceDevice,
    ]);
    mockGetLinodes([
      mockLegacyLinode,
      mockNoLIInterfacesLinode,
      mockOnlyVlanLILinode,
      mockAlreadyAssignedLILinode,
    ]);
    mockGetLinodeInterfaces(mockNoLIInterfacesLinode.id, {
      interfaces: [],
    });
    mockGetLinodeInterfaces(mockOnlyVlanLILinode.id, {
      interfaces: [mockVlanInterface],
    });
    mockGetLinodeInterfaces(mockAlreadyAssignedLILinode.id, {
      interfaces: [mockPublicInterface],
    });
    cy.visitWithLogin(`/firewalls/${mockFirewall.id}/linodes`);

    // confirm firewall has two devices
    cy.findByLabelText('List of Linodes attached to this firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText(mockLegacyLinode.label).should('be.visible');
        cy.findByText(mockAlreadyAssignedLILinode.label).should('be.visible');
      });

    ui.button
      .findByTitle('Add Linodes to Firewall')
      .should('be.visible')
      .click();

    // Confirm no Linodes show up in the Linode select
    ui.drawer
      .findByTitle(`Add Linode to Firewall: ${mockFirewall.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Linodes').should('be.visible').click();

        ui.autocompletePopper
          .findByTitle('No available Linodes')
          .should('be.visible');
      });
  });

  /**
   * - Confirms error handling if a firewall is unable to be assigned
   */
  it('shows an error if a firewall device cannot be assigned', () => {
    
  });
});
