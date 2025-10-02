/**
 * Confirms create operations on LKE-Enterprise clusters.
 */

import { linodeTypeFactory, regionFactory } from '@linode/utilities';
import {
  clusterPlans,
  latestEnterpriseTierKubernetesVersion,
  mockedLKEClusterTypes,
  mockedLKEEnterprisePrices,
  mockTieredEnterpriseVersions,
  mockTieredStandardVersions,
} from 'support/constants/lke';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetFirewalls } from 'support/intercepts/firewalls';
import { mockGetLinodeTypes } from 'support/intercepts/linodes';
import {
  mockCreateCluster,
  mockCreateClusterError,
  mockGetCluster,
  mockGetLKEClusterTypes,
  mockGetTieredKubernetesVersions,
} from 'support/intercepts/lke';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVPCs } from 'support/intercepts/vpc';
import { ui } from 'support/ui';
import { lkeClusterCreatePage } from 'support/ui/pages';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  accountFactory,
  firewallFactory,
  kubernetesClusterFactory,
  subnetFactory,
  vpcFactory,
} from 'src/factories';
import { extendType } from 'src/utilities/extendType';

const clusterLabel = randomLabel();
const selectedVpcId = 1;
const selectedSubnetId = 1;

const mockEnterpriseCluster = kubernetesClusterFactory.build({
  k8s_version: latestEnterpriseTierKubernetesVersion.id,
  label: clusterLabel,
  region: 'us-iad',
  tier: 'enterprise',
});

const mockVpcs = [
  {
    ...vpcFactory.build(),
    id: selectedVpcId,
    label: 'test-vpc',
    region: 'us-iad',
    subnets: [
      subnetFactory.build({
        id: selectedSubnetId,
        label: 'subnet-a',
        ipv4: '10.0.0.0/13',
      }),
    ],
  },
];

const mockDualStackVPCRegion = regionFactory.build({
  capabilities: [
    'Linodes',
    'Kubernetes',
    'Kubernetes Enterprise',
    'VPCs',
    'VPC Dual Stack',
  ],
  id: 'us-iad',
  label: 'Washington, DC',
});
const mockNoDualStackVPCRegion = regionFactory.build({
  capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise', 'VPCs'],
});

describe('LKE Cluster Creation with LKE-E', () => {
  beforeEach(() => {
    // TODO LKE-E: Remove feature flag mocks once we're in GA
    mockAppendFeatureFlags({
      lkeEnterprise2: {
        enabled: true,
        la: true,
        postLa: false,
        phase2Mtc: { byoVPC: true, dualStack: true },
      },
    }).as('getFeatureFlags');
    mockGetAccount(
      accountFactory.build({
        capabilities: [
          'Kubernetes Enterprise',
          'Kubernetes Enterprise BYO VPC',
          'Kubernetes Enterprise Dual Stack',
        ],
      })
    ).as('getAccount');

    mockGetTieredKubernetesVersions('enterprise', [
      latestEnterpriseTierKubernetesVersion,
    ]).as('getEnterpriseTieredVersions');
    mockGetTieredKubernetesVersions('standard', mockTieredStandardVersions).as(
      'getStandardTieredVersions'
    );

    mockGetLinodeTypes(mockedLKEClusterTypes).as('getLinodeTypes');
    mockGetLKEClusterTypes(mockedLKEEnterprisePrices).as(
      'getLKEEnterpriseClusterTypes'
    );
    mockCreateCluster(mockEnterpriseCluster).as('createCluster');

    mockGetRegions([mockNoDualStackVPCRegion, mockDualStackVPCRegion]).as(
      'getRegions'
    );
    mockGetVPCs(mockVpcs).as('getVPCs');

    cy.visitWithLogin('/kubernetes/clusters');
    cy.wait(['@getAccount']);

    ui.button.findByTitle('Create Cluster').click();
    cy.url().should('endWith', '/kubernetes/create');
    cy.wait(['@getLinodeTypes']);
  });

  describe('LKE-E Phase 2 Networking Configurations', () => {
    // Accounts for the different combination of IP Networking and VPC/Subnet radio selections
    const possibleNetworkingConfigurations = [
      {
        description:
          'Successfully creates cluster with auto-generated dual-stack VPC and IPv4+IPv6 stack',
        isUsingOwnVPC: false,
        stackType: 'ipv4-ipv6',
      },
      {
        description:
          'Successfully creates cluster with auto-generated dual-stack VPC and IPv4 stack',
        isUsingOwnVPC: false,
        stackType: 'ipv4',
      },
      {
        description:
          'Successfully creates cluster with existing (BYO) dual-stack VPC and IPv4+IPv6 stack',
        isUsingOwnVPC: true,
        stackType: 'ipv4-ipv6',
      },
      {
        description:
          'Successfully creates cluster with existing (BYO) dual-stack VPC and IPv4 stack',
        isUsingOwnVPC: true,
        stackType: 'ipv4',
      },
    ];

    possibleNetworkingConfigurations.forEach(
      ({ description, isUsingOwnVPC, stackType }) => {
        it(`${description}`, () => {
          // Select the enterprise tier and available region
          cy.findByLabelText('Cluster Label').type(clusterLabel);
          cy.findByText('LKE Enterprise').click();

          cy.wait(['@getLKEEnterpriseClusterTypes', '@getRegions']);

          ui.regionSelect.find().clear().type('Washington, DC{enter}');
          cy.wait('@getVPCs');

          // Select either the autogenerated or existing (BYO) VPC radio button
          if (isUsingOwnVPC) {
            cy.findByLabelText('Use an existing VPC').click();

            // Select the existing VPC and Subnet to use
            ui.autocomplete.findByLabel('VPC').click();
            cy.findByText('test-vpc').click();
            ui.autocomplete.findByLabel('Subnet').click();
            cy.findByText(/subnet-a/).click();
          }

          // Select either the IPv4 or IPv4 + IPv6 (dual-stack) IP Networking radio button
          cy.findByLabelText(
            stackType === 'ipv4' ? 'IPv4' : 'IPv4 + IPv6 (dual-stack)'
          ).click();

          // Select a plan and add nodes
          cy.findByText(clusterPlans[0].tab).should('be.visible').click();
          cy.findByText(clusterPlans[0].planName)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.get('[name="Quantity"]').should('be.visible').click();
              cy.focused().type(`{selectall}${clusterPlans[0].nodeCount}`);

              ui.button
                .findByTitle('Add')
                .should('be.visible')
                .should('be.enabled')
                .click();
            });

          // Bypass ACL validation error
          cy.get('input[name="acl-acknowledgement"]').check();

          // Create LKE-E cluster
          cy.get('[data-testid="kube-checkout-bar"]')
            .should('be.visible')
            .within(() => {
              ui.button
                .findByTitle('Create Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();
            });

          // Confirm request payload
          cy.wait('@createCluster').then((intercept) => {
            const payload = intercept.request.body;

            expect(payload.stack_type).to.eq(stackType);
            // Confirm existing (BYO) VPC selection passes the vpc_id and subnet_id;
            // else, confirm undefined is passed for an autogenerated VPC
            if (isUsingOwnVPC) {
              expect(payload.vpc_id).to.eq(selectedVpcId);
              expect(payload.subnet_id).to.eq(selectedSubnetId);
            } else {
              expect(payload.vpc_id).to.be.undefined;
              expect(payload.subnet_id).to.be.undefined;
            }
          });
        });
      }
    );
  });

  describe('LKE-E Cluster Error Handling', () => {
    /*
     * Surfaces an API errors on the page.
     */
    it('surfaces API error when creating cluster with an invalid configuration', () => {
      const mockErrorMessage =
        'There was a general error when creating your cluster.';

      mockGetVPCs(mockVpcs).as('getVPCs');
      mockCreateClusterError(mockErrorMessage).as('createClusterError');

      cy.findByLabelText('Cluster Label').type(clusterLabel);
      cy.findByText('LKE Enterprise').click();
      cy.wait(['@getLKEEnterpriseClusterTypes', '@getRegions']);

      ui.regionSelect.find().clear().type('Washington, DC{enter}');
      cy.wait('@getVPCs');

      cy.findByLabelText(
        'Automatically generate a VPC for this cluster'
      ).click();
      cy.findByLabelText('IPv4 + IPv6 (dual-stack)').click();

      // Bypass ACL validation
      cy.get('input[name="acl-acknowledgement"]').check();

      // Select a plan and add nodes
      cy.findByText(clusterPlans[0].tab).should('be.visible').click();
      cy.findByText(clusterPlans[0].planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]').should('be.visible').click();
          cy.focused().type(`{selectall}${clusterPlans[0].nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.get('[data-testid="kube-checkout-bar"]').within(() => {
        ui.button.findByTitle('Create Cluster').click();
      });

      cy.wait('@createClusterError');
      cy.findByText(mockErrorMessage).should('be.visible');
    });

    /**
     * Surfaces field-level errors on the page.
     */
    it('surfaces field-level errors on VPC fields', () => {
      // Intercept the create cluster request and force an error response
      cy.intercept('POST', '/v4beta/lke/clusters', {
        statusCode: 400,
        body: {
          errors: [
            {
              reason: 'There is an error configuring this VPC.',
              field: 'vpc_id',
            },
            {
              reason: 'There is an error configuring this subnet.',
              field: 'subnet_id',
            },
          ],
        },
      }).as('createClusterError');

      cy.findByLabelText('Cluster Label').type(clusterLabel);
      cy.findByText('LKE Enterprise').click();

      // Select region, VPC, subnet, and IP stack
      ui.regionSelect.find().clear().type('Washington, DC{enter}');
      cy.findByLabelText('Use an existing VPC').click();
      ui.autocomplete.findByLabel('VPC').click();
      cy.findByText('test-vpc').click();
      ui.autocomplete.findByLabel('Subnet').click();
      cy.findByText(/subnet-a/).click();
      cy.findByLabelText('IPv4 + IPv6 (dual-stack)').click();

      // Bypass ACL validation
      cy.get('input[name="acl-acknowledgement"]').check();

      // Select a plan and add nodes
      cy.findByText(clusterPlans[0].tab).should('be.visible').click();
      cy.findByText(clusterPlans[0].planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]').should('be.visible').click();
          cy.focused().type(`{selectall}${clusterPlans[0].nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Try to submit the form
      cy.get('[data-testid="kube-checkout-bar"]').within(() => {
        ui.button.findByTitle('Create Cluster').click();
      });

      // Confirm error messages display
      cy.wait('@createClusterError');
      cy.findByText('There is an error configuring this VPC.').should(
        'be.visible'
      );
      cy.findByText('There is an error configuring this subnet.').should(
        'be.visible'
      );
    });

    /*
     * Surfaces client-side validation error for VPC selection.
     */
    it('surfaces a client-side validation error when BYO VPC is selected but no VPC is chosen', () => {
      mockGetVPCs(mockVpcs).as('getVPCs');
      const errorText =
        'You must either select a VPC or select automatic VPC generation.';

      cy.findByLabelText('Cluster Label').type(clusterLabel);
      cy.findByText('LKE Enterprise').click();
      cy.wait(['@getLKEEnterpriseClusterTypes', '@getRegions']);

      ui.regionSelect.find().clear().type('Washington, DC{enter}');
      cy.wait('@getVPCs');

      // Bypass ACL validation
      cy.get('input[name="acl-acknowledgement"]').check();

      // Select a plan and add nodes
      cy.findByText(clusterPlans[0].tab).should('be.visible').click();
      cy.findByText(clusterPlans[0].planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]').should('be.visible').click();
          cy.focused().type(`{selectall}${clusterPlans[0].nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Select the 'bring your own' VPC option
      cy.findByLabelText('Use an existing VPC').click();

      // Try to create the cluster without actually selecting a VPC
      cy.get('[data-testid="kube-checkout-bar"]').within(() => {
        ui.button.findByTitle('Create Cluster').click();
      });

      // Confirm error surfaces on the VPC field
      cy.findByText(errorText).should('be.visible');

      // Confirm switching to an autogenerated VPC clears the error
      cy.findByLabelText(
        'Automatically generate a VPC for this cluster'
      ).click();
      cy.findByText(errorText).should('not.exist');

      // Confirm the error stays cleared when switching back to the existing VPC option
      cy.findByLabelText('Use an existing VPC').click();
      cy.findByText(errorText).should('not.exist');
    });

    it('disables the dual stack IP Stack option if the region capability is not present', () => {
      cy.findByLabelText('Cluster Label').type(clusterLabel);
      cy.findByText('LKE Enterprise').click();

      // Before region selection, confirm both IP Stack options are enabled initially and the default is selected.
      cy.findByLabelText('IPv4').should('be.checked');
      cy.findByLabelText('IPv4 + IPv6 (dual-stack)').should('be.enabled');

      ui.regionSelect
        .find()
        .clear()
        .type(`${mockDualStackVPCRegion.label}{enter}`);

      // Confirm the dual stack option is available for a region with VPC IPv6.
      cy.findByLabelText('IPv4 + IPv6 (dual-stack)')
        .should('be.enabled')
        .click();

      // Change the region.
      ui.regionSelect
        .find()
        .clear()
        .type(`${mockNoDualStackVPCRegion.label}{enter}`);

      // Confirm the dual stack option is disabled and default is reset after the region changes to a non-VPC IPv6 capable region.
      cy.findByLabelText('IPv4 + IPv6 (dual-stack)').should('be.disabled');
      cy.findByLabelText('IPv4').should('be.checked');
    });
  });
});

/*
 * Tests for the LKE-E create flow when the `lkeEnterprise2.postLa` feature flag is enabled.
 * The main change introduced by this feature flag is a new flow when adding node pools:
 * Node pool size is specified inside of a configuration drawer instead of directly in the plan table,
 * and additional node pool options have been added exclusively for LKE Enterprise clusters.
 */
describe('LKE Enterprise cluster creation with LKE-E Post-LA', () => {
  const mockRegionsNoEnterprise = regionFactory.buildList(3, {
    capabilities: ['Linodes', 'Kubernetes'],
  });

  const mockRegions = [
    ...mockRegionsNoEnterprise,
    ...regionFactory.buildList(3, {
      capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
    }),
  ];

  const mockStandardPlan = extendType(
    linodeTypeFactory.build({
      class: 'standard',
    })
  );

  const mockPlan = extendType(
    linodeTypeFactory.build({
      class: 'dedicated',
    })
  );

  const mockPlans = [
    mockStandardPlan,
    mockPlan,
    ...linodeTypeFactory
      .buildList(10, {
        class: 'dedicated',
      })
      .map((plan) => extendType(plan)),
  ];

  beforeEach(() => {
    mockAppendFeatureFlags({
      lkeEnterprise2: {
        enabled: true,
        la: true,
        postLa: true,
        phase2Mtc: { byoVPC: false, dualStack: false },
      },
    });
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Kubernetes Enterprise'],
      })
    );
    mockGetTieredKubernetesVersions('standard', mockTieredStandardVersions);
    mockGetTieredKubernetesVersions('enterprise', mockTieredEnterpriseVersions);
  });

  /*
   * - Confirms that a user can create an Enterprise LKE cluster when the LKE-E Post-LA feature is enabled.
   * - Confirms that user can add and configure node pools via the Configure Node Pools drawer.
   * - Confirms that a user can create a cluster with more than 1 node pool.
   * - Confirms that outgoing cluster create API request contains the expected payload data.
   * - Confirms that UI redirects to cluster details page upon successful cluster creation.
   */
  it('can create LKE-E clusters with the LKE-E Post-LA feature flag enabled', () => {
    const mockCluster = kubernetesClusterFactory.build({
      label: randomLabel(),
      tier: 'enterprise',
      region: chooseRegion({
        capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
        regions: mockRegions,
      }).id,
    });

    const mockSecondPlan = extendType(
      linodeTypeFactory.build({
        class: 'dedicated',
      })
    );

    const mockFirewall = firewallFactory.build();

    mockGetRegions(mockRegions);
    mockGetFirewalls([mockFirewall]);
    mockGetLinodeTypes([...mockPlans, mockSecondPlan]);
    mockCreateCluster(mockCluster).as('createCluster');
    mockGetCluster(mockCluster);

    cy.visitWithLogin('/kubernetes/create');

    // Configure an Enterprise LKE cluster.
    lkeClusterCreatePage.setLabel(mockCluster.label);
    lkeClusterCreatePage.selectClusterTier('enterprise');
    lkeClusterCreatePage.selectRegionById(mockCluster.region, mockRegions);
    lkeClusterCreatePage.setEnableBypassAcl(true);
    lkeClusterCreatePage.selectPlanTab('Dedicated CPU');
    lkeClusterCreatePage.selectNodePoolPlan(mockPlan.formattedLabel);

    // Create a node pool with the default options set, then confirm the order
    // summary UI updates to reflect node pool selection.
    lkeClusterCreatePage.withinNodePoolDrawer(mockPlan.formattedLabel, () => {
      cy.findByText('Update Strategy').should('be.visible');
      cy.findByText('Firewall').should('be.visible');
      ui.button
        .findByTitle('Add Pool')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    lkeClusterCreatePage.withinOrderSummary(() => {
      cy.findByText('LKE Enterprise').should('be.visible');
      cy.contains(mockPlan.formattedLabel)
        .closest('[data-testid="node-pool-summary"]')
        .within(() => {
          cy.findByText('3 Nodes').should('be.visible');
          cy.findByText('Edit Configuration').should('be.visible').click();
        });
    });

    // Update node pool size and update strategy, then add a new node pool.
    lkeClusterCreatePage.withinNodePoolDrawer(mockPlan.formattedLabel, () => {
      cy.findByLabelText('Add 1')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.findByText('Update Strategy').should('be.visible').click();
      cy.focused().type('Rolling Updates');
      ui.autocompletePopper.findByTitle('Rolling Updates').click();

      ui.button
        .findByTitle('Update Pool')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    lkeClusterCreatePage.selectNodePoolPlan(mockSecondPlan.formattedLabel);
    lkeClusterCreatePage.withinNodePoolDrawer(
      mockSecondPlan.formattedLabel,
      () => {
        cy.findByText('Select existing firewall').click();
        cy.get('[aria-label="Firewall"]').type(mockFirewall.label);
        ui.autocompletePopper.findByTitle(mockFirewall.label).click();

        ui.button
          .findByTitle('Add Pool')
          .should('be.visible')
          .should('be.enabled')
          .click();
      }
    );

    // Confirm that both node pools are listed with the expected node pool
    // count shown, then click "Create Cluster".
    lkeClusterCreatePage.withinOrderSummary(() => {
      cy.contains(mockPlan.formattedLabel)
        .closest('[data-testid="node-pool-summary"]')
        .within(() => {
          cy.findByText('4 Nodes').should('be.visible');
        });

      cy.contains(mockSecondPlan.formattedLabel)
        .closest('[data-testid="node-pool-summary"]')
        .within(() => {
          cy.findByText('3 Nodes').should('be.visible');
        });

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.wait('@createCluster').then((xhr) => {
      const body = xhr.request.body;
      expect(body['label']).to.equal(mockCluster.label);
      expect(body['region']).to.equal(mockCluster.region);
      expect(body['tier']).to.equal('enterprise');
      expect(body['control_plane']['acl']['enabled']).to.be.true;
      expect(body['control_plane']['high_availability']).to.be.true;

      // Confirm node pool payload is expected:
      // - Both node pools are included in the request
      // - Specified configuration is honored for each node pool
      expect(body['node_pools']).to.be.an('array');
      expect(body['node_pools']).to.have.length(2);

      expect(body['node_pools'][0]['type']).to.equal(mockPlan.id);
      expect(body['node_pools'][0]['count']).to.equal(4);
      expect(body['node_pools'][0]['update_strategy']).to.equal(
        'rolling_update'
      );
      expect(body['node_pools'][0]['firewall_id']).to.be.undefined;

      expect(body['node_pools'][1]['type']).to.equal(mockSecondPlan.id);
      expect(body['node_pools'][1]['count']).to.equal(3);
      expect(body['node_pools'][1]['update_strategy']).to.equal('on_recycle');
      expect(body['node_pools'][1]['firewall_id']).to.equal(mockFirewall.id);
    });

    cy.url().should('endWith', `kubernetes/clusters/${mockCluster.id}/summary`);
  });

  /*
   * - Confirms that Enterprise LKE cluster creation works when a user initially configures an LKE-E cluster.
   * - Configures a standard LKE cluster, then switches to an Enterprise cluster before proceeding.
   * - Confirms that UI reacts to switch as expected, and invalid configurations (e.g. region) are reset.
   * - Confirms that outgoing cluster request respects user selection, and cluster is created as expected.
   */
  it('can switch to an Enterprise cluster after configuring a standard LKE cluster with the LKE-E Post-LA feature enabled', () => {
    const mockFirstRegion = chooseRegion({ regions: mockRegionsNoEnterprise });
    const mockRegion = chooseRegion({
      capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
      regions: mockRegions,
    });
    const mockCluster = kubernetesClusterFactory.build({
      label: randomLabel(),
      tier: 'enterprise',
      region: mockRegion.id,
    });

    mockGetRegions(mockRegions);
    mockGetLinodeTypes(mockPlans);
    mockCreateCluster(mockCluster).as('createCluster');
    mockGetCluster(mockCluster);

    cy.visitWithLogin('/kubernetes/create');

    lkeClusterCreatePage.setLabel(mockCluster.label);
    lkeClusterCreatePage.selectClusterTier('standard');
    lkeClusterCreatePage.selectPlanTab('Shared CPU');
    lkeClusterCreatePage.setEnableApl(false);

    // Initially select a region and HA control plane that
    // selection which isn't supported under LKE-E.
    lkeClusterCreatePage.selectRegionById(mockFirstRegion.id, mockRegions);
    lkeClusterCreatePage.setEnableHighAvailability(false);

    // Change selection from a standard cluster to an Enterprise LKE cluster,
    // confirm that region selection has been reset, then switch back to standard
    // and choose a new region which supports LKE-E.
    lkeClusterCreatePage.selectClusterTier('enterprise');
    cy.findByLabelText('Region').should('have.value', '');

    lkeClusterCreatePage.selectClusterTier('standard');
    lkeClusterCreatePage.selectRegionById(mockCluster.region, mockRegions);

    // Add a node pool.
    lkeClusterCreatePage.selectNodePoolPlan(mockStandardPlan.formattedLabel);
    lkeClusterCreatePage.withinNodePoolDrawer(
      mockStandardPlan.formattedLabel,
      () => {
        ui.button
          .findByTitle('Add Pool')
          .should('be.visible')
          .should('be.enabled')
          .click();
      }
    );

    lkeClusterCreatePage.withinOrderSummary(() => {
      cy.contains(mockStandardPlan.formattedLabel)
        .closest('[data-testid="node-pool-summary"]')
        .within(() => {
          cy.findByText('3 Nodes').should('be.visible');
        });
    });

    // Switch back to LKE-E, assert that region selection persists in this case.
    lkeClusterCreatePage.selectClusterTier('enterprise');
    cy.findByLabelText('Region').should(
      'have.value',
      `${mockRegion.label} (${mockRegion.id})`
    );

    lkeClusterCreatePage.withinOrderSummary(() => {
      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    // Confirm that a UI error appears because ACL IPs haven't been specified.
    // Bypass ACL IP selection, and proceed with creation.
    cy.findByText(
      'At least one IP address or CIDR range is required for LKE Enterprise.'
    ).should('be.visible');

    lkeClusterCreatePage.setEnableBypassAcl(true);
    lkeClusterCreatePage.withinOrderSummary(() => {
      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.wait('@createCluster').then((xhr) => {
      const body = xhr.request.body;
      expect(body['label']).to.equal(mockCluster.label);
      expect(body['region']).to.equal(mockRegion.id);
      expect(body['tier']).to.equal('enterprise');
      expect(body['control_plane']['acl']['enabled']).to.be.true;
      expect(body['control_plane']['high_availability']).to.be.true;

      // Assert node pool configuration is as expected.
      // `firewall_id` and `update_strategy` are `undefined` because the node
      // pool was configured while the standard tier was selected. However,
      // this is still a valid request and the API uses default values in this
      // case.
      expect(body['node_pools']).to.be.an('array');
      expect(body['node_pools']).to.have.length(1);
      expect(body['node_pools'][0]['type']).to.equal(mockStandardPlan.id);
      expect(body['node_pools'][0]['count']).to.equal(3);
      expect(body['node_pools'][0]['firewall_id']).to.be.undefined;
      expect(body['node_pools'][0]['update_strategy']).to.be.undefined;
    });
    cy.url().should(
      'endWith',
      `/kubernetes/clusters/${mockCluster.id}/summary`
    );
  });
});
