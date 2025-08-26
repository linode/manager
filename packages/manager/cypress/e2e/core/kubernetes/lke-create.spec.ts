/**
 * @file LKE creation end-to-end tests.
 */
import {
  dedicatedTypeFactory,
  linodeTypeFactory,
  pluralize,
  regionFactory,
} from '@linode/utilities';
import {
  dcPricingDocsLabel,
  dcPricingDocsUrl,
  dcPricingLkeCheckoutSummaryPlaceholder,
  dcPricingLkeClusterPlans,
  dcPricingLkeHAPlaceholder,
  dcPricingMockLinodeTypes,
  dcPricingPlanPlaceholder,
} from 'support/constants/dc-specific-pricing';
import {
  clusterPlans,
  dedicatedNodeCount,
  dedicatedType,
  latestEnterpriseTierKubernetesVersion,
  latestKubernetesVersion,
  mockedLKEClusterTypes,
  mockedLKEEnterprisePrices,
  nanodeNodeCount,
  nanodeType,
} from 'support/constants/lke';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeTypes } from 'support/intercepts/linodes';
import {
  mockCreateCluster,
  mockCreateClusterError,
  mockGetApiEndpoints,
  mockGetCluster,
  mockGetClusterPools,
  mockGetClusters,
  mockGetControlPlaneACL,
  mockGetDashboardUrl,
  mockGetKubernetesVersions,
  mockGetLKEClusterTypes,
  mockGetTieredKubernetesVersions,
} from 'support/intercepts/lke';
import {
  mockGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomItem, randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion, extendRegion } from 'support/util/regions';

import {
  accountFactory,
  kubeLinodeFactory,
  kubernetesClusterFactory,
  kubernetesControlPlaneACLFactory,
  kubernetesControlPlaneACLOptionsFactory,
  nodePoolFactory,
} from 'src/factories';
import {
  CLUSTER_TIER_DOCS_LINK,
  CLUSTER_VERSIONS_DOCS_LINK,
} from 'src/features/Kubernetes/constants';
import { getTotalClusterMemoryCPUAndStorage } from 'src/features/Kubernetes/kubeUtils';
import { getTotalClusterPrice } from 'src/utilities/pricing/kubernetes';

import type { PriceType } from '@linode/api-v4/lib/types';
import type { LkePlanDescription } from 'support/api/lke';

const clusterRegion = chooseRegion({
  capabilities: ['Kubernetes'],
  exclude: ['au-mel', 'eu-west'], // Unavailable regions
});
const dedicatedCpuPool = nodePoolFactory.build({
  count: dedicatedNodeCount,
  nodes: kubeLinodeFactory.buildList(dedicatedNodeCount),
  type: 'g6-dedicated-2',
});
const nanodeMemoryPool = nodePoolFactory.build({
  count: nanodeNodeCount,
  nodes: kubeLinodeFactory.buildList(nanodeNodeCount),
  type: 'g6-standard-1',
});

const mockedLKEClusterPrices: PriceType[] = [
  {
    id: 'lke-sa',
    label: 'LKE Standard Availability',
    price: {
      hourly: 0.0,
      monthly: 0.0,
    },
    region_prices: [],
    transfer: 0,
  },
];
const mockedLKEHAClusterPrices: PriceType[] = [
  {
    id: 'lke-ha',
    label: 'LKE High Availability',
    price: {
      hourly: 0.09,
      monthly: 60.0,
    },
    region_prices: [],
    transfer: 0,
  },
];

const validEnterprisePlanTabs = [
  'Dedicated CPU',
  'Shared CPU',
  'High Memory',
  'Premium CPU',
];
const validStandardPlanTabs = [...validEnterprisePlanTabs, 'GPU'];

describe('LKE Cluster Creation', () => {
  beforeEach(() => {
    // Mock feature flag -- @TODO LKE-E: Remove feature flag once LKE-E is fully rolled out
    mockAppendFeatureFlags({
      lkeEnterprise: {
        enabled: true,
        la: true,
        postLa: false,
        phase2Mtc: true,
      },
    }).as('getFeatureFlags');
  });

  /*
   * - Confirms that users can create a cluster by completing the LKE create form.
   * - Confirms that no IP Stack or VPC options are visible for standard tier clusters (LKE-E only).
   * - Confirms that LKE cluster is created.
   * - Confirms that user is redirected to new LKE cluster summary page.
   * - Confirms that correct information is shown on the LKE cluster summary page
   * - Confirms that new LKE cluster summary page shows expected node pools.
   * - Confirms that new LKE cluster is shown on LKE clusters landing page.
   */

  // Test only available regions with standard pricing.
  const clusterRegion = chooseRegion({
    capabilities: ['Kubernetes'],
    exclude: ['au-mel', 'eu-west', 'id-cgk', 'br-gru'],
  });
  const clusterLabel = randomLabel();
  const clusterVersion = '1.31';
  const mockedLKECluster = kubernetesClusterFactory.build({
    label: clusterLabel,
    region: clusterRegion.id,
  });
  const mockedLKEClusterPools = [nanodeMemoryPool, dedicatedCpuPool];
  const mockedLKEClusterControlPlane = kubernetesControlPlaneACLFactory.build();
  const {
    CPU: totalCpu,
    RAM: totalMemory,
    Storage: totalStorage,
  } = getTotalClusterMemoryCPUAndStorage(
    mockedLKEClusterPools,
    mockedLKEClusterTypes
  );

  it('can create an LKE cluster', () => {
    mockCreateCluster(mockedLKECluster).as('createCluster');
    mockGetCluster(mockedLKECluster).as('getCluster');
    mockGetClusterPools(mockedLKECluster.id, mockedLKEClusterPools).as(
      'getClusterPools'
    );
    mockGetDashboardUrl(mockedLKECluster.id).as('getDashboardUrl');
    mockGetControlPlaneACL(
      mockedLKECluster.id,
      mockedLKEClusterControlPlane
    ).as('getControlPlaneACL');
    mockGetApiEndpoints(mockedLKECluster.id).as('getApiEndpoints');
    mockGetLinodeTypes(mockedLKEClusterTypes).as('getLinodeTypes');
    mockGetLKEClusterTypes(mockedLKEClusterPrices).as('getLKEClusterTypes');
    mockGetClusters([mockedLKECluster]).as('getClusters');
    mockGetKubernetesVersions([clusterVersion]).as('getKubernetesVersions');

    cy.visitWithLogin('/kubernetes/clusters');

    ui.button
      .findByTitle('Create Cluster')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/kubernetes/create');

    cy.wait(['@getLinodeTypes']);

    // Fill out LKE creation form label, region, and Kubernetes version fields.
    cy.get('[data-qa-textfield-label="Cluster Label"]')
      .should('be.visible')
      .click();
    cy.focused().type(`${clusterLabel}{enter}`);

    ui.regionSelect.find().click().type(`${clusterRegion.label}{enter}`);

    ui.autocomplete.findByLabel('Kubernetes Version').click();

    cy.findByText(`${clusterVersion}`).should('be.visible').click();

    cy.get('[data-testid="ha-radio-button-no"]').should('be.visible').click();

    // Confirms LKE-E Phase 2 IP Stack and VPC options do not display for a standard LKE cluster.
    cy.findByText('IP Stack').should('not.exist');
    cy.findByText('IPv4', { exact: true }).should('not.exist');
    cy.findByText('IPv4 + IPv6 (dual-stack)').should('not.exist');
    cy.findByText('Automatically generate a VPC for this cluster').should(
      'not.exist'
    );
    cy.findByText('Use an existing VPC').should('not.exist');

    let monthPrice = 0;

    // Confirm the expected available plans display.
    validStandardPlanTabs.forEach((tab) => {
      ui.tabList.findTabByTitle(tab).should('be.visible');
    });

    // Add a node pool for each selected plan, and confirm that the
    // selected node pool plan is added to the checkout bar.
    clusterPlans.forEach((clusterPlan) => {
      const nodeCount = clusterPlan.nodeCount;
      const planName = clusterPlan.planName;

      cy.log(`Adding ${nodeCount}x ${planName} node(s)`);
      // Click the right tab for the plan, and add a node pool with the desired
      // number of nodes.
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      const quantityInput = '[name="Quantity"]';
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get(quantityInput).should('be.visible');
          cy.get(quantityInput).click();

          // Ensure the max node count is 100 for LKE
          cy.get(quantityInput).type(`{selectall}101`);
          cy.get(quantityInput).should('have.value', 100);

          cy.get(quantityInput).type(`{selectall}${nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that node pool is shown in the checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          // It's possible that multiple pools of the same type get added.
          // We're taking a naive approach here by confirming that at least one
          // instance of the pool appears in the checkout bar.
          cy.findAllByText(`${planName} Plan`).first().should('be.visible');

          // Confirm LKE-E line item is NOT shown
          cy.findByText('LKE Enterprise').should('not.exist');
        });
      // Expected information on the LKE cluster summary page.
      monthPrice = getTotalClusterPrice({
        highAvailabilityPrice: 0,
        pools: [nanodeMemoryPool, dedicatedCpuPool],
        region: clusterRegion.id,
        types: mockedLKEClusterTypes,
      });
    });

    // Create LKE cluster.
    cy.get('[data-testid="kube-checkout-bar"]')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Create Cluster')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm request payload does not include LKE-E-specific values.
    cy.wait('@createCluster').then((intercept) => {
      const payload = intercept.request.body;
      expect(payload.stack_type).to.be.undefined;
      expect(payload.vpc_id).to.be.undefined;
      expect(payload.subnet_id).to.be.undefined;
    });

    // Wait for LKE cluster to be created and confirm that we are redirected
    // to the cluster summary page.
    cy.wait([
      '@getCluster',
      '@getClusterPools',
      '@getLKEClusterTypes',
      '@getDashboardUrl',
      '@getControlPlaneACL',
      '@getApiEndpoints',
    ]);
    cy.url().should(
      'endWith',
      `/kubernetes/clusters/${mockedLKECluster.id}/summary`
    );

    // Confirm that each node pool is shown.
    clusterPlans.forEach((clusterPlan) => {
      // Because multiple node pools may have identical labels, we figure out
      // how many identical labels for each plan will exist and confirm that
      // the expected number is present.
      const nodePoolLabel = clusterPlan.planName;
      const similarNodePoolCount = getSimilarPlans(
        clusterPlan,
        clusterPlans
      ).length;

      // Confirm that the cluster created with the expected parameters.
      cy.findAllByText(`${clusterRegion.label}`).should('be.visible');
      cy.findAllByText(`${totalCpu} CPU Cores`).should('be.visible');
      cy.findAllByText(`${Math.round(totalStorage / 1024)} GB Storage`).should(
        'be.visible'
      );
      cy.findAllByText(`${Math.round(totalMemory / 1024)} GB RAM`).should(
        'be.visible'
      );
      cy.findAllByText(`$${monthPrice.toFixed(2)}/month`).should('be.visible');
      cy.contains('Kubernetes API Endpoint').should('be.visible');
      cy.contains('linodelke.net:443').should('be.visible');

      cy.findAllByText(nodePoolLabel, { selector: 'h3' })
        .should('have.length', similarNodePoolCount)
        .first()
        .should('be.visible');

      // Confirm total number of nodes are shown for each pool
      cy.findAllByText(
        pluralize('Node', 'Nodes', clusterPlan.nodeCount)
      ).should('be.visible');
    });

    ui.breadcrumb
      .find()
      .should('be.visible')
      .within(() => {
        cy.findByText(clusterLabel).should('be.visible');
      });
  });
});

describe('LKE Cluster Creation with APL enabled', () => {
  it('can create an LKE cluster with APL flag enabled', () => {
    const clusterLabel = randomLabel();
    const mockedLKECluster = kubernetesClusterFactory.build({
      label: clusterLabel,
      region: clusterRegion.id,
    });
    const mockedLKEClusterPools = [nanodeMemoryPool, dedicatedCpuPool];
    const mockedLKEClusterControlPlane =
      kubernetesControlPlaneACLFactory.build();
    const dedicated4Type = dedicatedTypeFactory.build({
      disk: 163840,
      id: 'g6-dedicated-4',
      label: 'Dedicated 8GB',
      memory: 8192,
      price: {
        hourly: 0.108,
        monthly: 72.0,
      },
      region_prices: dcPricingMockLinodeTypes.find(
        (type) => type.id === 'g6-dedicated-8'
      )?.region_prices,
      vcpus: 4,
    });
    const dedicated8Type = dedicatedTypeFactory.build({
      disk: 327680,
      id: 'g6-dedicated-8',
      label: 'Dedicated 16GB',
      memory: 16384,
      price: {
        hourly: 0.216,
        monthly: 144.0,
      },
      region_prices: dcPricingMockLinodeTypes.find(
        (type) => type.id === 'g6-dedicated-8'
      )?.region_prices,
      vcpus: 8,
    });

    const mockedAPLLKEClusterTypes = [
      dedicatedType,
      dedicated4Type,
      dedicated8Type,
      nanodeType,
    ];
    mockAppendFeatureFlags({
      apl: true,
      aplGeneralAvailability: true,
      lkeEnterprise: { enabled: true, la: true, postLa: false },
    }).as('getFeatureFlags');
    mockCreateCluster(mockedLKECluster).as('createCluster');
    mockGetCluster(mockedLKECluster).as('getCluster');
    mockGetClusterPools(mockedLKECluster.id, mockedLKEClusterPools).as(
      'getClusterPools'
    );
    mockGetDashboardUrl(mockedLKECluster.id).as('getDashboardUrl');
    mockGetControlPlaneACL(
      mockedLKECluster.id,
      mockedLKEClusterControlPlane
    ).as('getControlPlaneACL');
    mockGetLinodeTypes(mockedAPLLKEClusterTypes).as('getLinodeTypes');
    mockGetLKEClusterTypes(mockedLKEHAClusterPrices).as('getLKEClusterTypes');
    mockGetApiEndpoints(mockedLKECluster.id).as('getApiEndpoints');

    cy.visitWithLogin('/kubernetes/create');

    cy.wait(['@getFeatureFlags', '@getLinodeTypes', '@getLKEClusterTypes']);

    // Enter cluster details
    cy.get('[data-qa-textfield-label="Cluster Label"]')
      .should('be.visible')
      .click();
    cy.focused().type(`${clusterLabel}{enter}`);

    ui.regionSelect.find().click().type(`${clusterRegion.label}{enter}`);

    cy.findByTestId('apl-label').should('have.text', 'Akamai App Platform');
    cy.findByTestId('newFeatureChip')
      .should('be.visible')
      .should('have.text', 'new');
    cy.findByTestId('apl-radio-button-yes').should('be.visible').click();
    cy.findByTestId('ha-radio-button-yes').should('be.disabled');
    cy.get(
      '[aria-label="Enabled by default when Akamai App Platform is enabled."]'
    ).should('be.visible');

    // Check that Shared CPU plans are disabled
    ui.tabList.findTabByTitle('Shared CPU').click();
    cy.findByText(
      'Shared CPU instances are currently not available for Akamai App Platform.'
    ).should('be.visible');
    cy.get('[data-qa-plan-row="Linode 2 GB"]').should('have.attr', 'disabled');

    // Check that Dedicated CPU plans are available if greater than 8GB
    ui.tabList.findTabByTitle('Dedicated CPU').click();
    cy.get('[data-qa-plan-row="Dedicated 4 GB"]').should(
      'have.attr',
      'disabled'
    );
    cy.get('[data-qa-plan-row="Dedicated 8 GB"]').should(
      'not.have.attr',
      'disabled'
    );
    cy.get('[data-qa-plan-row="Dedicated 16 GB"]').within(() => {
      cy.get('[name="Quantity"]').click();
      cy.get('[name="Quantity"]').type('{selectall}3');

      ui.button
        .findByTitle('Add')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    // Check that the checkout bar displays the correct information
    cy.get('[data-testid="kube-checkout-bar"]')
      .should('be.visible')
      .within(() => {
        cy.findByText(`Dedicated 16 GB Plan`).should('be.visible');
        cy.findByText('$432.00').should('be.visible');
        cy.findByText('High Availability (HA) Control Plane').should(
          'be.visible'
        );
        cy.findByText('$60.00/month').should('be.visible');
        cy.findByText('$492.00').should('be.visible');

        ui.button
          .findByTitle('Create Cluster')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait([
      '@createCluster',
      '@getCluster',
      '@getClusterPools',
      '@getDashboardUrl',
      '@getControlPlaneACL',
      '@getApiEndpoints',
    ]);
  });
});

describe('LKE Cluster Creation with DC-specific pricing', () => {
  beforeEach(() => {
    // Mock feature flag -- @TODO LKE-E: Remove feature flag once LKE-E is fully rolled out
    mockAppendFeatureFlags({
      lkeEnterprise: { enabled: true, la: true, postLa: false },
    }).as('getFeatureFlags');
  });

  /*
   * - Confirms that DC-specific prices are present in the LKE create form.
   * - Confirms that pricing docs link is shown in "Region" section.
   * - Confirms that the plan table shows a message in place of plans when a region is not selected.
   * - Confirms that the cluster summary create button is disabled until a plan and region selection are made.
   * - Confirms that HA helper text updates dynamically to display pricing when a region is selected.
   */
  it('can dynamically update prices when creating an LKE cluster based on region', () => {
    const dcSpecificPricingRegion = extendRegion(
      regionFactory.build({
        capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
      })
    );
    mockGetRegions([dcSpecificPricingRegion]).as('getRegions');
    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');

    const clusterLabel = randomLabel();
    const clusterPlans = new Array(2)
      .fill(null)
      .map(() => randomItem(dcPricingLkeClusterPlans));

    cy.visitWithLogin('/kubernetes/clusters');

    ui.button
      .findByTitle('Create Cluster')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/kubernetes/create');

    cy.wait(['@getRegions', '@getLinodeTypes']);

    // Confirm that, without a region selected, no pricing information is displayed.

    // Confirm checkout summary displays helper text and disabled create button.
    cy.findByText(dcPricingLkeCheckoutSummaryPlaceholder).should('be.visible');
    cy.get('[data-qa-deploy-linode]')
      .should('contain.text', 'Create Cluster')
      .should('be.disabled');

    // Confirm that plans table displays helper text instead of plans and prices.
    cy.contains(dcPricingPlanPlaceholder).should('be.visible');

    // Confirm that HA pricing displays helper text instead of price.
    cy.contains(dcPricingLkeHAPlaceholder).should('be.visible');

    // Confirm docs link to pricing page is visible.
    cy.findByText(dcPricingDocsLabel)
      .should('be.visible')
      .should('have.attr', 'href', dcPricingDocsUrl);

    // Fill out LKE creation form label, region, and Kubernetes version fields.
    cy.findByLabelText('Cluster Label').should('be.visible').click();
    cy.focused().type(`${clusterLabel}{enter}`);

    ui.regionSelect.find().click();
    cy.focused().type(`${dcSpecificPricingRegion.label}{enter}`);

    // Confirm that HA price updates dynamically once region selection is made.
    // eslint-disable-next-line sonarjs/slow-regex
    cy.contains(/\$.*\/month/).should('be.visible');

    cy.get('[data-testid="ha-radio-button-yes"]').should('be.visible').click();

    // Confirm that with region and HA selections, create button is still disabled until plan selection is made.
    cy.get('[data-qa-deploy-linode]')
      .should('contain.text', 'Create Cluster')
      .should('be.disabled');

    // Add a node pool for each randomly selected plan, and confirm that the
    // selected node pool plan is added to the checkout bar.
    clusterPlans.forEach((clusterPlan) => {
      const nodeCount = randomNumber(1, 3);
      const planName = clusterPlan.planName;

      cy.log(`Adding ${nodeCount}x ${clusterPlan.planName} node(s)`);
      // Click the right tab for the plan, and add a node pool with the desired
      // number of nodes.
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]').should('be.visible').click();
          cy.focused().type(`{selectall}${nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that node pool is shown in the checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          // It's possible that multiple pools of the same type get added.
          // We're taking a naive approach here by confirming that at least one
          // instance of the pool appears in the checkout bar.
          cy.findAllByText(`${planName} Plan`).first().should('be.visible');
        });
    });

    // Confirm that create button is enabled.
    cy.get('[data-testid="kube-checkout-bar"]')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Create Cluster')
          .should('be.visible')
          .should('be.enabled');
      });
  });
});

describe('LKE Cluster Creation with ACL', () => {
  beforeEach(() => {
    // Mock feature flag -- @TODO LKE-E: Remove feature flag once LKE-E is fully rolled out
    mockAppendFeatureFlags({
      lkeEnterprise: { enabled: true, la: true, postLa: false },
    }).as('getFeatureFlags');
  });

  // setting up mocks
  const clusterLabel = randomLabel();
  const mockRegion = regionFactory.build({
    capabilities: ['Linodes', 'Kubernetes'],
    id: 'us-east',
    label: 'Newark, US',
  });
  const mockLinodeTypes = [
    linodeTypeFactory.build({
      class: 'dedicated',
      id: 'dedicated-1',
      label: 'dedicated-1',
    }),
    linodeTypeFactory.build({
      class: 'dedicated',
      id: 'dedicated-2',
      label: 'dedicated-2',
    }),
  ];
  const clusterVersion = '1.31';
  const clusterPlan = { size: 2, tab: 'Dedicated CPU', type: 'Dedicated' };
  const nodeCount = 1;
  const planName = 'dedicated-1';
  const checkoutName = 'dedicated-1 Plan';

  describe('with LKE IPACL account capability', () => {
    beforeEach(() => {
      mockGetKubernetesVersions([clusterVersion]).as('getLKEVersions');
      mockGetRegions([mockRegion]).as('getRegions');
      mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
      mockGetRegionAvailability(mockRegion.id, []).as('getRegionAvailability');
    });

    /**
     * - Confirms create flow when ACL is toggled off
     * - Confirms LKE summary page shows that ACL is not enabled
     */
    it('creates an LKE cluster with ACL disabled', () => {
      const mockACL = kubernetesControlPlaneACLFactory.build({
        acl: {
          enabled: false,
        },
      });
      const mockCluster = kubernetesClusterFactory.build({
        control_plane: mockACL,
        k8s_version: clusterVersion,
        label: clusterLabel,
        region: mockRegion.id,
      });
      mockCreateCluster(mockCluster).as('createCluster');
      mockGetCluster(mockCluster).as('getCluster');
      mockGetControlPlaneACL(mockCluster.id, mockACL).as('getControlPlaneACL');

      cy.visitWithLogin('/kubernetes/clusters');

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/kubernetes/create');
      cy.wait(['@getRegions', '@getLinodeTypes', '@getLKEVersions']);

      // Fill out LKE creation form label, region, and Kubernetes version fields.
      cy.findByLabelText('Cluster Label').should('be.visible').click();
      cy.focused().type(`${clusterLabel}{enter}`);

      ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);
      cy.wait(['@getRegionAvailability']);

      cy.findByLabelText('Kubernetes Version').should('be.visible').click();
      cy.findByText(`${clusterVersion}`).should('be.visible').click();

      cy.get('[data-testid="ha-radio-button-yes"]')
        .should('be.visible')
        .click();

      // Confirm that ACL is disabled by default.
      cy.contains('Control Plane ACL').should('be.visible');
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'false')
        .should('be.visible');

      // Add a node pool
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]').should('be.visible').click();
          cy.focused().type(`{selectall}${nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that node pool is shown in the checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          cy.findAllByText(checkoutName).first().should('be.visible');
        });

      // create cluster
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@createCluster').then(() => {
        cy.url().should(
          'endWith',
          `/kubernetes/clusters/${mockCluster.id}/summary`
        );
      });

      cy.wait(['@getCluster', '@getControlPlaneACL']);

      // Confirms Summary panel displays as expected
      cy.contains('Control Plane ACL').should('be.visible');
      ui.button.findByTitle('Enable').should('be.visible').should('be.enabled');
    });

    /**
     * - Confirms create flow when ACL is toggled on
     * - Confirms adding IPs
     * - Confirms LKE summary page shows that ACL is enabled
     */
    it('creates an LKE cluster with ACL enabled', () => {
      const mockACLOptions = kubernetesControlPlaneACLOptionsFactory.build();

      const mockACL = kubernetesControlPlaneACLFactory.build({
        acl: mockACLOptions,
      });

      const mockCluster = kubernetesClusterFactory.build({
        control_plane: mockACL,
        k8s_version: clusterVersion,
        label: clusterLabel,
        region: mockRegion.id,
      });
      mockCreateCluster(mockCluster).as('createCluster');
      mockGetCluster(mockCluster).as('getCluster');
      mockGetControlPlaneACL(mockCluster.id, mockACL).as('getControlPlaneACL');

      cy.visitWithLogin('/kubernetes/clusters');

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/kubernetes/create');

      // Fill out LKE creation form label, region, and Kubernetes version fields.
      cy.findByLabelText('Cluster Label').should('be.visible').click();
      cy.focused().type(`${clusterLabel}{enter}`);

      ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);

      cy.findByLabelText('Kubernetes Version').should('be.visible').click();
      cy.findByText(`${clusterVersion}`).should('be.visible').click();

      cy.get('[data-testid="ha-radio-button-yes"]')
        .should('be.visible')
        .click();

      // Confirm ACL is disabled by default, then enable it.
      cy.contains('Control Plane ACL').should('be.visible');
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'false')
        .should('be.visible')
        .click();

      ui.toggle.find().should('have.attr', 'data-qa-toggle', 'true');

      // Add some IPv4s and an IPv6
      cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click();
      cy.focused().type('10.0.0.0/24');
      cy.findByText('Add IPv4 Address')
        .should('be.visible')
        .should('be.enabled')
        .click();
      cy.get('[id="domain-transfer-ip-1"]').should('be.visible').click();
      cy.focused().type('10.0.1.0/24');
      cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click();
      cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
      cy.findByText('Add IPv6 Address')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Add a node pool
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]').should('be.visible').click();
          cy.focused().type(`{selectall}${nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that node pool is shown in the checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          cy.findAllByText(checkoutName).first().should('be.visible');
        });

      // create cluster
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@createCluster').then(() => {
        cy.url().should(
          'endWith',
          `/kubernetes/clusters/${mockCluster.id}/summary`
        );
      });

      cy.wait(['@getCluster', '@getControlPlaneACL']);

      // Confirms Summary panel displays as expected
      cy.contains('Control Plane ACL').should('be.visible');
      ui.button
        .findByTitle('Enabled (3 IP Addresses)')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Confirm that the Revision ID has been auto-generated by the API
      cy.get('[data-qa-drawer="true"]').within(() => {
        cy.findByLabelText('Revision ID').within(() => {
          cy.get('input').should('not.be.empty');
        });
      });
    });

    /**
     * - Confirms create flow for LKE-E cluster with ACL enabled by default
     * - Confirms at least one IP must be provided for ACL unless acknowledgement is checked
     * - Confirms the cluster details page shows ACL is enabled
     */
    it('creates an LKE-E cluster with ACL enabled by default and handles IP address validation', () => {
      const clusterLabel = randomLabel();
      const mockedEnterpriseCluster = kubernetesClusterFactory.build({
        k8s_version: latestEnterpriseTierKubernetesVersion.id,
        label: clusterLabel,
        region: 'us-iad',
        tier: 'enterprise',
      });
      const mockedEnterpriseClusterPools = [nanodeMemoryPool];
      const mockACL = kubernetesControlPlaneACLFactory.build({
        acl: {
          addresses: {
            ipv4: [],
            ipv6: [],
          },
          enabled: true,
        },
      });
      mockGetControlPlaneACL(mockedEnterpriseCluster.id, mockACL).as(
        'getControlPlaneACL'
      );
      mockGetAccount(
        accountFactory.build({
          capabilities: ['Kubernetes Enterprise'],
        })
      ).as('getAccount');
      mockGetTieredKubernetesVersions('enterprise', [
        latestEnterpriseTierKubernetesVersion,
      ]).as('getTieredKubernetesVersions');
      mockGetKubernetesVersions([latestKubernetesVersion]).as(
        'getKubernetesVersions'
      );
      mockGetLinodeTypes(mockedLKEClusterTypes).as('getLinodeTypes');
      mockGetLKEClusterTypes(mockedLKEEnterprisePrices).as(
        'getLKEEnterpriseClusterTypes'
      );
      mockGetRegions([
        regionFactory.build({
          capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
          id: 'us-iad',
          label: 'Washington, DC',
        }),
      ]).as('getRegions');
      mockGetCluster(mockedEnterpriseCluster).as('getCluster');
      mockCreateCluster(mockedEnterpriseCluster).as('createCluster');
      mockGetClusters([mockedEnterpriseCluster]).as('getClusters');
      mockGetClusterPools(
        mockedEnterpriseCluster.id,
        mockedEnterpriseClusterPools
      ).as('getClusterPools');
      mockGetApiEndpoints(mockedEnterpriseCluster.id).as('getApiEndpoints');

      cy.visitWithLogin('/kubernetes/clusters');
      cy.wait(['@getAccount']);

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/kubernetes/create');
      cy.wait(['@getKubernetesVersions', '@getTieredKubernetesVersions']);

      // Select enterprise tier.
      cy.get(`[data-qa-select-card-heading="LKE Enterprise"]`)
        .closest('[data-qa-selection-card]')
        .click();

      cy.wait(['@getLKEEnterpriseClusterTypes', '@getRegions']);

      // Select a supported region.
      ui.regionSelect.find().clear().type('Washington, DC{enter}');

      // Select an enterprise version.
      ui.autocomplete
        .findByLabel('Kubernetes Version')
        .should('be.visible')
        .click();

      clusterPlans.forEach((clusterPlan) => {
        const nodeCount = clusterPlan.nodeCount;
        const planName = clusterPlan.planName;
        // Click the right tab for the plan, and add a node pool with the desired
        // number of nodes.
        cy.findByText(clusterPlan.tab).should('be.visible').click();
        const quantityInput = '[name="Quantity"]';
        cy.findByText(planName)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.get(quantityInput).should('be.visible');
            cy.get(quantityInput).click();
            cy.get(quantityInput).type(`{selectall}${nodeCount}`);

            ui.button
              .findByTitle('Add')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });
      });

      // Confirm ACL is enabled by default.
      cy.contains('Control Plane ACL').should('be.visible');
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'true')
        .should('be.visible');
      cy.findByRole('checkbox', { name: /Provide an ACL later/ }).should(
        'not.be.checked'
      );

      // Try to submit the form without the ACL acknowledgement checked.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm error validation requires an ACL IP.
      cy.findByText(
        'At least one IP address or CIDR range is required for LKE Enterprise.'
      ).should('be.visible');

      // Add an IP.
      cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click();
      cy.focused().clear();
      cy.focused().type('10.0.0.0/24');

      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          // Try to submit the form again.
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm the validation message is gone.
      cy.findByText(
        'At least one IP address or CIDR range is required for LKE Enterprise.'
      ).should('not.exist');

      // Check the acknowledgement to prevent IP validation.
      cy.findByRole('checkbox', { name: /Provide an ACL later/ }).check();

      // Confirm the fields are disabled.
      cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0').within(() => {
        cy.get('input').should('be.visible').should('be.disabled');
      });
      cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0').within(() => {
        cy.get('input').should('be.visible').should('be.disabled');
      });

      // Finally, add a label, so the form will submit.
      cy.findByLabelText('Cluster Label').should('be.visible').click();
      cy.focused().type(`${clusterLabel}{enter}`);

      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          // Try to submit the form.
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm the validation message is gone.
      cy.findByText(
        'At least one IP address or CIDR range is required for LKE Enterprise.'
      ).should('not.exist');

      cy.wait([
        '@getCluster',
        '@getClusterPools',
        '@createCluster',
        '@getLKEEnterpriseClusterTypes',
        '@getLinodeTypes',
        '@getApiEndpoints',
        '@getControlPlaneACL',
      ]);

      cy.url().should(
        'endWith',
        `/kubernetes/clusters/${mockedEnterpriseCluster.id}/summary`
      );

      // Confirms Summary panel displays as expected
      cy.contains('Control Plane ACL').should('be.visible');
      ui.button
        .findByTitle('Enabled (0 IP Addresses)')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Confirm that the Revision ID has been auto-generated by the API
      cy.get('[data-qa-drawer="true"]').within(() => {
        cy.findByLabelText('Revision ID').within(() => {
          cy.get('input').should('not.be.empty');
        });
      });
    });

    /**
     * - Confirms IP validation error appears when a bad IP is entered
     * - Confirms IP validation error disappears when a valid IP is entered
     * - Confirms API error appears as expected and doesn't crash the page
     */
    it('can handle validation and API errors', () => {
      const mockErrorMessage = 'Control Plane ACL error: request failed';
      mockCreateClusterError(mockErrorMessage, 400).as('createClusterError');

      cy.visitWithLogin('/kubernetes/clusters');

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/kubernetes/create');

      // Fill out LKE creation form label, region, and Kubernetes version fields.
      cy.findByLabelText('Cluster Label').should('be.visible').click();
      cy.focused().type(`${clusterLabel}{enter}`);

      ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);

      cy.findByLabelText('Kubernetes Version').should('be.visible').click();
      cy.findByText(`${clusterVersion}`).should('be.visible').click();

      cy.get('[data-testid="ha-radio-button-yes"]')
        .should('be.visible')
        .click();

      // Enable ACL
      cy.contains('Control Plane ACL').should('be.visible');
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'false')
        .should('be.visible')
        .click();

      ui.toggle.find().should('have.attr', 'data-qa-toggle', 'true');

      // Confirm ACL IPv4 validation works as expected
      cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click();
      cy.focused().type('invalid ip');

      // click out of textbox and confirm error is visible
      cy.contains('Control Plane ACL').should('be.visible').click();
      cy.contains('Must be a valid IPv4 address.').should('be.visible');
      // enter valid IP
      cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click();
      cy.focused().clear();
      cy.focused().type('10.0.0.0/24');
      // Click out of textbox and confirm error is gone
      cy.contains('Control Plane ACL').should('be.visible').click();
      cy.contains('Must be a valid IPv4 address.').should('not.exist');

      // Confirm ACL IPv6 validation works as expected
      cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click();
      cy.focused().type('invalid ip');
      // click out of textbox and confirm error is visible
      cy.contains('Control Plane ACL').should('be.visible').click();
      cy.contains('Must be a valid IPv6 address.').should('be.visible');
      // enter valid IP
      cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click();
      cy.focused().clear();
      cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
      // Click out of textbox and confirm error is gone
      cy.contains('Control Plane ACL').should('be.visible').click();
      cy.contains('Must be a valid IPv6 address.').should('not.exist');

      // Add a node pool
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]').should('be.visible').click();
          cy.focused().type(`{selectall}${nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that node pool is shown in the checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          cy.findAllByText(checkoutName).first().should('be.visible');
        });

      // Attempt to create cluster
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm API error displays
      cy.wait('@createClusterError');
      cy.contains(mockErrorMessage).should('be.visible');
    });
  });
});

describe('LKE Cluster Creation with LKE-E', () => {
  /**
   * - Confirms LKE-E flow does not exist if account doesn't have the corresponding capability
   * @todo LKE-E: Remove this test once LKE-E is fully rolled out
   */
  it('does not show the LKE-E flow with the feature flag off', () => {
    mockAppendFeatureFlags({
      lkeEnterprise: { enabled: false, la: false, postLa: false },
    }).as('getFeatureFlags');
    cy.visitWithLogin('/kubernetes/clusters');

    ui.button
      .findByTitle('Create Cluster')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/kubernetes/create');

    cy.contains('Cluster Tier').should('not.exist');
  });

  describe('shows the LKE-E flow with the feature flag on', () => {
    beforeEach(() => {
      // Mock feature flag -- @TODO LKE-E: Remove feature flag once LKE-E is fully rolled out
      mockAppendFeatureFlags({
        lkeEnterprise: { enabled: true, la: true, postLa: false },
      }).as('getFeatureFlags');
    });

    /**
     * - Mocks the LKE-E capability
     * - Confirms the Cluster Tier selection can be made
     * - Confirms that HA is enabled by default with LKE-E selection
     * - Confirms an LKE-E supported region can be selected
     * - Confirms an LKE-E supported k8 version can be selected
     * - Confirms the APL section is disabled while it remains unsupported
     * - Confirms the VPC & Firewall placeholder section displays with correct copy
     * - Confirms ACL is enabled by default
     * - Confirms the checkout bar displays the correct LKE-E info
     * - Confirms an enterprise cluster can be created with the correct chip, version, and price
     * - Confirms that the total node count for each pool is displayed
     * - Confirms that the max nodes is 500
     */
    it('creates an LKE-E cluster with the account capability', () => {
      const clusterLabel = randomLabel();
      const mockedEnterpriseCluster = kubernetesClusterFactory.build({
        k8s_version: latestEnterpriseTierKubernetesVersion.id,
        label: clusterLabel,
        region: 'us-iad',
        tier: 'enterprise',
      });
      const mockedEnterpriseClusterPools = [nanodeMemoryPool, dedicatedCpuPool];
      const mockACL = kubernetesControlPlaneACLFactory.build({
        acl: {
          addresses: {
            ipv4: ['10.0.0.0/24'],
            ipv6: [],
          },
          enabled: true,
        },
      });
      const monthlyClusterPrice = getTotalClusterPrice({
        highAvailabilityPrice: 0,
        enterprisePrice: 300,
        pools: [nanodeMemoryPool, dedicatedCpuPool],
        region: clusterRegion.id,
        types: mockedLKEClusterTypes,
      });

      mockGetControlPlaneACL(mockedEnterpriseCluster.id, mockACL).as(
        'getControlPlaneACL'
      );
      mockGetAccount(
        accountFactory.build({
          capabilities: ['Kubernetes Enterprise'],
        })
      ).as('getAccount');
      mockGetTieredKubernetesVersions('enterprise', [
        latestEnterpriseTierKubernetesVersion,
      ]).as('getTieredKubernetesVersions');
      mockGetKubernetesVersions([latestKubernetesVersion]).as(
        'getKubernetesVersions'
      );
      mockGetLinodeTypes(mockedLKEClusterTypes).as('getLinodeTypes');
      mockGetLKEClusterTypes(mockedLKEEnterprisePrices).as(
        'getLKEEnterpriseClusterTypes'
      );
      mockGetRegions([
        regionFactory.build({
          capabilities: ['Linodes', 'Kubernetes'],
          id: 'us-east',
          label: 'Newark, US',
        }),
        regionFactory.build({
          capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
          id: 'us-iad',
          label: 'Washington, DC',
        }),
      ]).as('getRegions');
      mockGetCluster(mockedEnterpriseCluster).as('getCluster');
      mockCreateCluster(mockedEnterpriseCluster).as('createCluster');
      mockGetClusters([mockedEnterpriseCluster]).as('getClusters');
      mockGetClusterPools(
        mockedEnterpriseCluster.id,
        mockedEnterpriseClusterPools
      ).as('getClusterPools');
      mockGetApiEndpoints(mockedEnterpriseCluster.id).as('getApiEndpoints');

      cy.visitWithLogin('/kubernetes/clusters');
      cy.wait(['@getAccount']);

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/kubernetes/create');
      cy.wait([
        '@getKubernetesVersions',
        '@getTieredKubernetesVersions',
        '@getLinodeTypes',
      ]);

      cy.findByLabelText('Cluster Label').should('be.visible').click();
      cy.focused().type(`${clusterLabel}{enter}`);

      cy.findByText('Cluster Tier').should('be.visible');

      cy.findByText('Compare Tiers')
        .should('be.visible')
        .should('have.attr', 'href', CLUSTER_TIER_DOCS_LINK);

      // Confirm both Cluster Tiers exist and the LKE card is selected by default
      cy.get(`[data-qa-select-card-heading="LKE"]`)
        .closest('[data-qa-selection-card]')
        .should('be.visible')
        .should('have.attr', 'data-qa-selection-card-checked', 'true');

      cy.get(`[data-qa-select-card-heading="LKE Enterprise"]`)
        .closest('[data-qa-selection-card]')
        .should('be.visible')
        .should('have.attr', 'data-qa-selection-card-checked', 'false')
        .click();

      // Select LKE-E as the Cluster Tier
      cy.get(`[data-qa-select-card-heading="LKE Enterprise"]`)
        .closest('[data-qa-selection-card]')
        .should('be.visible')
        .should('have.attr', 'data-qa-selection-card-checked', 'true');

      cy.wait(['@getLKEEnterpriseClusterTypes', '@getRegions']);

      // Confirm unsupported regions are not displayed
      ui.regionSelect.find().click().type('Newark, NJ');
      ui.autocompletePopper.find().within(() => {
        cy.findByText('Newark, NJ (us-east)').should('not.exist');
      });

      // Select a supported region
      ui.regionSelect.find().clear().type('Washington, DC{enter}');

      // Confirm that there is a tooltip explanation for the region dropdown options
      ui.tooltip
        .findByText(
          'Only regions that support LKE Enterprise clusters are listed.'
        )
        .should('be.visible');

      // Selects an enterprise version
      ui.autocomplete
        .findByLabel('Kubernetes Version')
        .should('be.visible')
        .click();

      cy.findByText('Kubernetes Versions')
        .should('be.visible')
        .should('have.attr', 'href', CLUSTER_VERSIONS_DOCS_LINK);

      ui.autocompletePopper
        .findByTitle(latestEnterpriseTierKubernetesVersion.id)
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Confirm the APL section is disabled and unsupported.
      cy.findByTestId('apl-label').should('be.visible');
      cy.findByTestId('apl-coming-soon-chip').should(
        'have.text',
        'coming soon'
      );
      cy.findByTestId('apl-radio-button-yes').should('be.disabled');
      cy.findByTestId('apl-radio-button-no').within(() => {
        cy.findByRole('radio').should('be.disabled').should('be.checked');
      });

      // Confirm the VPC/Firewall section displays.
      cy.findByText('VPC & Firewall').should('be.visible');
      cy.findByText(
        'A VPC and Firewall are automatically generated for LKE Enterprise customers.'
      ).should('be.visible');

      // Confirm the expected available plans display.
      validEnterprisePlanTabs.forEach((tab) => {
        ui.tabList.findTabByTitle(tab).should('be.visible');
      });
      // Confirm the GPU tab is not visible in the plans panel for LKE-E.
      ui.tabList.findTabByTitle('GPU').should('not.exist');

      // Add a node pool for each selected plan, and confirm that the
      // selected node pool plan is added to the checkout bar.
      clusterPlans.forEach((clusterPlan) => {
        const nodeCount = clusterPlan.nodeCount;
        const planName = clusterPlan.planName;

        cy.log(`Adding ${nodeCount}x ${planName} node(s)`);
        // Click the right tab for the plan, and add a node pool with the desired
        // number of nodes.
        cy.findByText(clusterPlan.tab).should('be.visible').click();
        const quantityInput = '[name="Quantity"]';
        cy.findByText(planName)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.get(quantityInput).should('be.visible');
            cy.get(quantityInput).click();

            // Ensure the max node count is 500 for LKE-E
            cy.get(quantityInput).type(`{selectall}501`);
            cy.get(quantityInput).should('have.value', 500);

            cy.get(quantityInput).type(`{selectall}${nodeCount}`);

            ui.button
              .findByTitle('Add')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });
      });

      // Check that the checkout bar displays the correct information
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          // Confirm HA section is hidden since LKE-E includes HA by default
          cy.findByText('High Availability (HA) Control Plane').should(
            'not.exist'
          );

          // Confirm LKE-E section is shown
          cy.findByText('LKE Enterprise').should('be.visible');
          cy.findByText('$300.00/month').should('be.visible');

          cy.findByText('Dedicated 4 GB Plan').should('be.visible');
          cy.findByText('Linode 2 GB Plan').should('be.visible');

          cy.findByText(`$${monthlyClusterPrice.toFixed(2)}`).should(
            'be.visible'
          );
        });

      // Confirms ACL is enabled by default.
      cy.contains('Control Plane ACL').should('be.visible');
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'true')
        .should('be.visible');

      // Add an IP
      cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click();
      cy.focused().clear();
      cy.focused().type('10.0.0.0/24');

      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          // Successfully submit the form
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Wait for LKE cluster to be created and confirm that we are redirected
      // to the cluster summary page.
      cy.wait([
        '@getCluster',
        '@getClusterPools',
        '@createCluster',
        '@getLKEEnterpriseClusterTypes',
        '@getApiEndpoints',
        '@getControlPlaneACL',
      ]);

      cy.url().should(
        'endWith',
        `/kubernetes/clusters/${mockedEnterpriseCluster.id}/summary`
      );

      // Confirm the LKE-E cluster has the correct enterprise chip, version, and pricing.
      cy.findByText('ENTERPRISE').should('be.visible');
      cy.findByText(
        `Version ${latestEnterpriseTierKubernetesVersion.id}`
      ).should('be.visible');
      cy.findByText(`$${monthlyClusterPrice}.00/month`).should('be.visible');

      clusterPlans.forEach((clusterPlan) => {
        // Confirm total number of nodes are shown for each pool
        cy.findAllByText(
          pluralize('Node', 'Nodes', clusterPlan.nodeCount)
        ).should('be.visible');
      });
    });

    it('disables the Cluster Type selection without the LKE-E account capability', () => {
      mockGetAccount(
        accountFactory.build({
          capabilities: [],
        })
      ).as('getAccount');
      cy.visitWithLogin('/kubernetes/clusters');
      cy.wait(['@getAccount']);

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/kubernetes/create');

      // Confirm the Cluster Tier selection can be made when the LKE-E feature is enabled
      cy.findByText('Cluster Tier').should('be.visible');

      // Confirm both tiers exist and the LKE card is selected by default
      cy.get(`[data-qa-select-card-heading="LKE"]`)
        .closest('[data-qa-selection-card]')
        .should('be.visible')
        .should('have.attr', 'data-qa-selection-card-checked', 'true');

      cy.get(`[data-qa-select-card-heading="LKE Enterprise"]`)
        .closest('[data-qa-selection-card]')
        .should('be.visible')
        .should('have.attr', 'disabled');
    });
  });
});

/**
 * Returns each plan in an array which is similar to the given plan.
 *
 * Plans are considered similar if they have identical type and size.
 *
 * @param clusterPlan - Cluster plan with which to compare similarity.
 * @param clusterPlans - Array from which to find similar cluster plans.
 *
 * @returns Array of similar cluster plans.
 */
const getSimilarPlans = (
  clusterPlan: LkePlanDescription,
  clusterPlans: LkePlanDescription[]
) => {
  return clusterPlans.filter((otherClusterPlan) => {
    return (
      clusterPlan.type === otherClusterPlan.type &&
      clusterPlan.size === otherClusterPlan.size
    );
  });
};
