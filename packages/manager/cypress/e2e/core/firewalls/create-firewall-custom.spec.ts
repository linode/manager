/**
 * @file Integration tests for Firewall creation flows involving custom rules.
 */

import { linodeFactory, nodeBalancerFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateFirewall,
  mockGetFirewalls,
} from 'support/intercepts/firewalls';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetNodeBalancers } from 'support/intercepts/nodebalancers';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountFactory, firewallFactory } from 'src/factories';

describe('Can create Firewalls using custom rules', () => {
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
   * - Confirms users can create Firewalls using custom rules.
   * - Confirms Firewall can be created with default inbound/outbound policies.
   * - Confirms Firewall can be created with no Linodes or NodeBalancers attached.
   * - Confirms outgoing Firewall create request reflects the user's selected options.
   * - Confirms landing page automatically updates to show the new Firewall.
   */
  it('can create a Firewall using custom rules', () => {
    const mockFirewall = firewallFactory.build({
      label: randomLabel(),
      rules: {
        inbound: [],
        inbound_policy: 'DROP',
        outbound: [],
        outbound_policy: 'ACCEPT',
      },
      entities: [],
    });

    mockGetFirewalls([]);
    mockCreateFirewall(mockFirewall).as('createFirewall');

    cy.visitWithLogin('/firewalls');

    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Custom Firewall').should('be.checked');
        cy.findByText('Label').should('be.visible').type(mockFirewall.label);

        // Make no changes to the default selections, just click "Create Firewall".
        mockGetFirewalls([mockFirewall]);
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that outgoing API request contains expected payload. Specifically:
    //
    // - No Linodes or NodeBalancers assigned.
    // - Default inbound policy is DROP.
    // - Default outbound policy is ACCEPT.
    // - No other inbound or outbound rules specified.
    cy.wait('@createFirewall').then((xhr) => {
      expect(xhr.request.body.devices?.linodes).to.be.empty;
      expect(xhr.request.body.devices?.nodebalancers).to.be.empty;
      expect(xhr.request.body.rules?.inbound_policy).to.equal('DROP');
      expect(xhr.request.body.rules?.outbound_policy).to.equal('ACCEPT');
      expect(xhr.request.body.rules?.inbound).to.be.undefined;
      expect(xhr.request.body.rules?.outbound).to.be.undefined;
    });

    ui.toast.assertMessage(
      `Firewall ${mockFirewall.label} successfully created`
    );

    // Confirm that landing page automatically updates to list the new Firewall,
    // and the expected information is displayed.
    cy.findByText(mockFirewall.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('No rules').should('be.visible');
        cy.findByText('None assigned').should('be.visible');
      });
  });

  /*
   * - Confirms users can create Firewalls using custom rules.
   * - Confirms users can change inbound and outbound policy.
   * - Confirms Firewall can be created with a Linode attached.
   * - Confirms outgoing Firewall create request reflects the user's selected options.
   * - Confirms landing page automatically updates to show the new Firewall.
   */
  it('can create a Firewall using custom rules and assign Linodes', () => {
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const mockFirewall = firewallFactory.build({
      label: randomLabel(),
      rules: {
        inbound_policy: 'ACCEPT',
        inbound: undefined,
        outbound_policy: 'DROP',
        outbound: undefined,
      },
      entities: [
        {
          id: mockLinode.id,
          type: 'linode',
          label: mockLinode.label,
          url: `/linodes/${mockLinode.id}`,
        },
      ],
    });

    mockGetFirewalls([]);
    mockGetLinodes([mockLinode]);
    mockCreateFirewall(mockFirewall).as('createFirewall');

    cy.visitWithLogin('/firewalls');

    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Custom Firewall').should('be.checked');
        cy.findByText('Label').should('be.visible').type(mockFirewall.label);

        // Swap default inbound/outbound policies to later confirm that they
        // are included in the outgoing API request.
        cy.findByLabelText('default inbound policy').within(() => {
          cy.findByText('Accept').should('be.visible').click();
          cy.findByLabelText('Accept').should('be.checked');
          cy.findByLabelText('Drop').should('not.be.checked');
        });

        cy.findByLabelText('default outbound policy').within(() => {
          cy.findByText('Drop').should('be.visible').click();
          cy.findByLabelText('Drop').should('be.checked');
          cy.findByLabelText('Accept').should('not.be.checked');
        });

        // Assign a Linode
        cy.findByText('Linodes').should('be.visible').click();

        cy.focused().type(mockLinode.label);
        ui.autocompletePopper.findByTitle(mockLinode.label).click();
        cy.focused().type('{esc}');

        mockGetFirewalls([mockFirewall]);
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm outgoing request payload contains chosen Linode, and reflects
    // default inbound/outbound policy choice.
    cy.wait('@createFirewall').then((xhr) => {
      expect(xhr.request.body.devices?.linodes).to.deep.equal([mockLinode.id]);
      expect(xhr.request.body.devices?.nodebalancers).to.be.empty;
      expect(xhr.request.body.rules?.inbound_policy).to.equal('ACCEPT');
      expect(xhr.request.body.rules?.outbound_policy).to.equal('DROP');
      expect(xhr.request.body.rules?.inbound).to.be.undefined;
      expect(xhr.request.body.rules?.outbound).to.be.undefined;
    });

    ui.toast.assertMessage(
      `Firewall ${mockFirewall.label} successfully created`
    );

    cy.findByText(mockFirewall.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('No rules').should('be.visible');

        // Confirm that the attached Linode is shown in the table row.
        cy.findByText(mockLinode.label).should('be.visible');
      });
  });

  /*
   * - Confirms users can create Firewalls using custom rules.
   * - Confirms Firewall can be created with default inbound/outbound policies.
   * - Confirms Firewall can be created with a NodeBalancer attached.
   * - Confirms outgoing Firewall create request reflects the user's selected options.
   * - Confirms landing page automatically updates to show the new Firewall.
   */
  it('can create a Firewall using custom rules and assign NodeBalancers', () => {
    const mockNodeBalancer = nodeBalancerFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const mockFirewall = firewallFactory.build({
      label: randomLabel(),
      rules: {
        inbound_policy: 'DROP',
        inbound: undefined,
        outbound_policy: 'ACCEPT',
        outbound: undefined,
      },
      entities: [
        {
          id: mockNodeBalancer.id,
          type: 'nodebalancer',
          label: mockNodeBalancer.label,
          url: `/nodebalancers/${mockNodeBalancer.id}/summary`,
        },
      ],
    });

    mockGetFirewalls([]);
    mockGetNodeBalancers([mockNodeBalancer]);
    mockCreateFirewall(mockFirewall).as('createFirewall');

    cy.visitWithLogin('/firewalls');

    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Custom Firewall').should('be.checked');
        cy.findByText('Label').should('be.visible').type(mockFirewall.label);

        // Leave inbound and outbound defaults as-is.
        // Assign a NodeBalancer.
        cy.findByText('NodeBalancers').should('be.visible').click();

        cy.focused().type(mockNodeBalancer.label);
        ui.autocompletePopper.findByTitle(mockNodeBalancer.label).click();
        cy.focused().type('{esc}');

        // Create the Firewall.
        mockGetFirewalls([mockFirewall]);
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm outgoing request payload contains chosen NodeBalancer.
    cy.wait('@createFirewall').then((xhr) => {
      expect(xhr.request.body.devices?.linodes).to.be.empty;
      expect(xhr.request.body.devices?.nodebalancers).to.deep.equal([
        mockNodeBalancer.id,
      ]);
      expect(xhr.request.body.rules?.inbound_policy).to.equal('DROP');
      expect(xhr.request.body.rules?.outbound_policy).to.equal('ACCEPT');
      expect(xhr.request.body.rules?.inbound).to.be.undefined;
      expect(xhr.request.body.rules?.outbound).to.be.undefined;
    });

    ui.toast.assertMessage(
      `Firewall ${mockFirewall.label} successfully created`
    );

    cy.findByText(mockFirewall.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('No rules').should('be.visible');
        cy.findByText(mockNodeBalancer.label).should('be.visible');
      });
  });

  /*
   * - Confirms users can create Firewalls using custom rules.
   * - Confirms Firewall can be created with default inbound/outbound policies.
   * - Confirms Firewall can be created with a Linode and a NodeBalancer attached.
   * - Confirms outgoing Firewall create request reflects the user's selected options.
   * - Confirms landing page automatically updates to show the new Firewall.
   */
  it('can create a Firewall using custom rules, and assign Linodes and NodeBalancers', () => {
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const mockNodeBalancer = nodeBalancerFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const mockFirewall = firewallFactory.build({
      label: randomLabel(),
      rules: {
        inbound_policy: 'DROP',
        inbound: undefined,
        outbound_policy: 'ACCEPT',
        outbound: undefined,
      },
      entities: [
        {
          id: mockLinode.id,
          type: 'linode',
          label: mockLinode.label,
          url: `/linodes/${mockLinode.id}`,
        },
        {
          id: mockNodeBalancer.id,
          type: 'nodebalancer',
          label: mockNodeBalancer.label,
          url: `/nodebalancers/${mockNodeBalancer.id}/summary`,
        },
      ],
    });

    mockGetFirewalls([]);
    mockGetLinodes([mockLinode]);
    mockGetNodeBalancers([mockNodeBalancer]);
    mockCreateFirewall(mockFirewall).as('createFirewall');

    cy.visitWithLogin('/firewalls');

    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Custom Firewall').should('be.checked');
        cy.findByText('Label').should('be.visible').type(mockFirewall.label);

        // Leave inbound and outbound defaults as-is.
        // Assign a Linode and a NodeBalancer.
        cy.findByText('Linodes').should('be.visible').click();

        cy.focused().type(mockLinode.label);
        ui.autocompletePopper.findByTitle(mockLinode.label).click();
        cy.focused().type('{esc}');

        cy.findByText('NodeBalancers').should('be.visible').click();

        cy.focused().type(mockNodeBalancer.label);
        ui.autocompletePopper.findByTitle(mockNodeBalancer.label).click();
        cy.focused().type('{esc}');

        // Create the Firewall.
        mockGetFirewalls([mockFirewall]);
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm outgoing request payload contains chosen Linode and NodeBalancer.
    cy.wait('@createFirewall').then((xhr) => {
      expect(xhr.request.body.devices?.linodes).to.deep.equal([mockLinode.id]);
      expect(xhr.request.body.devices?.nodebalancers).to.deep.equal([
        mockNodeBalancer.id,
      ]);
      expect(xhr.request.body.rules?.inbound_policy).to.equal('DROP');
      expect(xhr.request.body.rules?.outbound_policy).to.equal('ACCEPT');
      expect(xhr.request.body.rules?.inbound).to.be.undefined;
      expect(xhr.request.body.rules?.outbound).to.be.undefined;
    });

    ui.toast.assertMessage(
      `Firewall ${mockFirewall.label} successfully created`
    );

    cy.findByText(mockFirewall.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('No rules').should('be.visible');
        cy.contains(mockLinode.label).should('be.visible');
        cy.contains(mockNodeBalancer.label).should('be.visible');
      });
  });
});
