import { linodeFactory, nodeBalancerFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetFirewalls,
  mockGetFirewallSettings,
} from 'support/intercepts/firewalls';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetNodeBalancers } from 'support/intercepts/nodebalancers';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  accountFactory,
  firewallFactory,
  firewallRuleFactory,
} from 'src/factories';

describe('confirms Firewalls landing page empty state is shown when no Firewalls exist', () => {
  /*
   * - Confirms that existing Firewalls are listed on the Firewalls landing page.
   * - Confirms that different Firewall configurations are displayed as expected.
   * - Confirms that users can navigate to entity detail pages using the "Services" column links.
   */
  it('lists all Firewalls', () => {
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
        inbound: undefined,
        outbound: undefined,
        inbound_policy: 'DROP',
        outbound_policy: 'ACCEPT',
      },
      entities: [],
    });

    const mockFirewallWithEntities = firewallFactory.build({
      label: randomLabel(),
      rules: {
        inbound: undefined,
        outbound: undefined,
        inbound_policy: 'DROP',
        outbound_policy: 'ACCEPT',
      },
      entities: [
        {
          type: 'linode',
          id: mockLinode.id,
          label: mockLinode.label,
          url: `/linodes/${mockLinode.id}`,
        },
        {
          type: 'nodebalancer',
          id: mockNodeBalancer.id,
          label: mockNodeBalancer.label,
          url: `/nodebalancers/${mockNodeBalancer.id}/summary`,
        },
      ],
    });

    const mockFirewallWithRules = firewallFactory.build({
      label: randomLabel(),
      rules: {
        inbound_policy: 'DROP',
        outbound_policy: 'DROP',
        inbound: [
          firewallRuleFactory.build({
            action: 'ACCEPT',
          }),
        ],
        outbound: firewallRuleFactory.buildList(2),
      },
      entities: [],
    });

    const mockFirewalls = [
      mockFirewall,
      mockFirewallWithEntities,
      mockFirewallWithRules,
    ];

    mockGetLinodes([mockLinode]);
    mockGetNodeBalancers([mockNodeBalancer]);
    mockGetFirewalls(mockFirewalls);
    cy.visitWithLogin('/firewalls');

    // Confirm that each Firewall is listed with the expected information.
    cy.findByText(mockFirewall.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('No rules').should('be.visible');
        cy.findByText('None assigned').should('be.visible');
      });

    cy.findByText(mockFirewallWithEntities.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('No rules').should('be.visible');
        cy.contains(`${mockLinode.label}, ${mockNodeBalancer.label}`).should(
          'be.visible'
        );
      });

    cy.findByText(mockFirewallWithRules.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('1 Inbound / 2 Outbound').should('be.visible');
        cy.findByText('None assigned').should('be.visible');
      });

    cy.findByText(mockLinode.label).click();
    cy.url().should('endWith', `/linodes/${mockLinode.id}/networking`);
    cy.go('back');

    cy.findByText(mockNodeBalancer.label).click();
    cy.url().should('endWith', `/nodebalancers/${mockNodeBalancer.id}/summary`);
  });

  /*
   * - Confirms that Firewalls that are designated as defaults are listed on landing page with chip.
   * - Confirms that Firewalls that are not designated as defaults are not listed with a chip.
   */
  it('lists default Firewalls', () => {
    /*
     * TODO M3-9775 - Remove feature flag and account mocks and combine this test with
     * the 'lists all Firewalls' when `linodeInterfaces` flag is removed.
     */
    const mockFirewallDefault = firewallFactory.build({ label: randomLabel() });
    const mockFirewallNotDefault = firewallFactory.build({
      label: randomLabel(),
    });

    mockAppendFeatureFlags({
      linodeInterfaces: {
        enabled: true,
      },
    });
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Linodes', 'Linode Interfaces', 'Cloud Firewall'],
      })
    );
    mockGetFirewalls([mockFirewallDefault, mockFirewallNotDefault]);
    mockGetFirewallSettings({
      default_firewall_ids: {
        linode: null,
        nodebalancer: null,
        public_interface: mockFirewallDefault.id,
        vpc_interface: null,
      },
    });

    cy.visitWithLogin('/firewalls');

    // Confirm that "DEFAULT" chip is listed next to Firewall that's designated as a default.
    cy.findByText(mockFirewallDefault.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('DEFAULT').should('be.visible');
      });

    // Confirm that "DEFAULT" chip is not listed next to a Firewall that is not designated as a default.
    cy.findByText(mockFirewallNotDefault.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('DEFAULT').should('not.exist');
      });
  });

  /*
   * - Confirms that Getting Started Guides is listed on landing page.
   * - Confirms that Video Playlist is listed on landing page.
   * - Confirms that clicking on Create Firewall button navigates user to firewall create page.
   */
  it('shows the empty state when no Firewalls exist', () => {
    mockGetFirewalls([]).as('getFirewalls');

    cy.visitWithLogin('/firewalls');
    cy.wait(['@getFirewalls']);

    cy.findByText('Secure cloud-based firewall').should('be.visible');
    cy.findByText(
      'Control network traffic to and from Linode Compute Instances with a simple management interface'
    ).should('be.visible');
    cy.findByText('Getting Started Guides').should('be.visible');
    cy.findByText('Video Playlist').should('be.visible');

    // Create Firewall button exists and clicking it navigates user to create firewall page.
    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/firewalls/create');
  });
});
