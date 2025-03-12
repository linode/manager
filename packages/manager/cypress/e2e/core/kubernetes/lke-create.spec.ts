/**
 * @file LKE creation end-to-end tests.
 */
import { pluralize, regionFactory } from '@linode/utilities';
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
  latestEnterpriseTierKubernetesVersion,
  latestKubernetesVersion,
} from 'support/constants/lke';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetAccountBeta } from 'support/intercepts/betas';
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
import { getRegionById } from 'support/util/regions';
import { chooseRegion } from 'support/util/regions';

import { lkeEnterpriseTypeFactory } from 'src/factories';
import {
  accountFactory,
  dedicatedTypeFactory,
  kubeLinodeFactory,
  kubernetesClusterFactory,
  kubernetesControlPlaneACLFactory,
  kubernetesControlPlaneACLOptionsFactory,
  linodeTypeFactory,
  lkeHighAvailabilityTypeFactory,
  nodePoolFactory,
} from 'src/factories';
import {
  CLUSTER_TIER_DOCS_LINK,
  CLUSTER_VERSIONS_DOCS_LINK,
} from 'src/features/Kubernetes/constants';
import { getTotalClusterMemoryCPUAndStorage } from 'src/features/Kubernetes/kubeUtils';
import { getTotalClusterPrice } from 'src/utilities/pricing/kubernetes';

import type { PriceType } from '@linode/api-v4/lib/types';
import type { ExtendedType } from 'src/utilities/extendType';
import type { LkePlanDescription } from 'support/api/lke';

const dedicatedNodeCount = 4;
const nanodeNodeCount = 3;

const clusterRegion = chooseRegion({
  capabilities: ['Kubernetes'],
});
const dedicatedCpuPool = nodePoolFactory.build({
  count: dedicatedNodeCount,
  nodes: kubeLinodeFactory.buildList(dedicatedNodeCount),
  type: 'g6-dedicated-2',
});
const nanodeMemoryPool = nodePoolFactory.build({
  count: nanodeNodeCount,
  nodes: kubeLinodeFactory.buildList(nanodeNodeCount),
  type: 'g6-nanode-1',
});
const dedicatedType = dedicatedTypeFactory.build({
  disk: 81920,
  id: 'g6-dedicated-2',
  label: 'Dedicated 4 GB',
  memory: 4096,
  price: {
    hourly: 0.054,
    monthly: 36.0,
  },
  region_prices: dcPricingMockLinodeTypes.find(
    (type) => type.id === 'g6-dedicated-2'
  )?.region_prices,
  vcpus: 2,
}) as ExtendedType;
const nanodeType = linodeTypeFactory.build({
  disk: 25600,
  id: 'g6-nanode-1',
  label: 'Linode 2 GB',
  memory: 2048,
  price: {
    hourly: 0.0075,
    monthly: 5.0,
  },
  region_prices: dcPricingMockLinodeTypes.find(
    (type) => type.id === 'g6-nanode-1'
  )?.region_prices,
  vcpus: 1,
}) as ExtendedType;
const gpuType = linodeTypeFactory.build({
  class: 'gpu',
  id: 'g2-gpu-1',
}) as ExtendedType;
const highMemType = linodeTypeFactory.build({
  class: 'highmem',
  id: 'g7-highmem-1',
}) as ExtendedType;
const premiumType = linodeTypeFactory.build({
  class: 'premium',
  id: 'g7-premium-1',
}) as ExtendedType;
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
const mockedLKEEnterprisePrices = [
  lkeHighAvailabilityTypeFactory.build(),
  lkeEnterpriseTypeFactory.build(),
];
const clusterPlans: LkePlanDescription[] = [
  {
    nodeCount: dedicatedNodeCount,
    planName: 'Dedicated 4 GB',
    size: 4,
    tab: 'Dedicated CPU',
    type: 'dedicated',
  },
  {
    nodeCount: nanodeNodeCount,
    planName: 'Linode 2 GB',
    size: 24,
    tab: 'Shared CPU',
    type: 'nanode',
  },
];
const mockedLKEClusterTypes = [
  dedicatedType,
  nanodeType,
  gpuType,
  highMemType,
  premiumType,
];
const validEnterprisePlanTabs = [
  'Dedicated CPU',
  'Shared CPU',
  'High Memory',
  'Premium CPU',
];
const validStandardPlanTabs = [...validEnterprisePlanTabs, 'GPU'];

describe('LKE Cluster Creation', () => {
  /*
   * - Confirms that users can create a cluster by completing the LKE create form.
   * - Confirms that LKE cluster is created.
   * - Confirms that user is redirected to new LKE cluster summary page.
   * - Confirms that correct information is shown on the LKE cluster summary page
   * - Confirms that new LKE cluster summary page shows expected node pools.
   * - Confirms that new LKE cluster is shown on LKE clusters landing page.
   */
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

    // Fill out LKE creation form label, region, and Kubernetes version fields.
    cy.get('[data-qa-textfield-label="Cluster Label"]')
      .should('be.visible')
      .click();
    cy.focused().type(`${clusterLabel}{enter}`);

    ui.regionSelect.find().click().type(`${clusterRegion.label}{enter}`);

    ui.autocomplete
      .findByLabel('Kubernetes Version')
      .click()
      .type(`${clusterVersion}{enter}`);

    cy.get('[data-testid="ha-radio-button-no"]').should('be.visible').click();

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

    // Wait for LKE cluster to be created and confirm that we are redirected
    // to the cluster summary page.
    cy.wait([
      '@getCluster',
      '@getClusterPools',
      '@createCluster',
      '@getLKEClusterTypes',
      '@getLinodeTypes',
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
      const similarNodePoolCount = getSimilarPlans(clusterPlan, clusterPlans)
        .length;

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

      cy.findAllByText(nodePoolLabel, { selector: 'h2' })
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
    const mockedLKEClusterControlPlane = kubernetesControlPlaneACLFactory.build();
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
      apl: {
        enabled: true,
      },
    }).as('getFeatureFlags');
    mockGetAccountBeta({
      id: 'apl',
      label: 'Akamai App Platform Beta',
      enrolled: '2024-11-04T21:39:41',
      description:
        'Akamai App Platform is a platform that combines developer and operations-centric tools, automation and self-service to streamline the application lifecycle when using Kubernetes. This process will pre-register you for an upcoming beta.',
      started: '2024-10-31T18:00:00',
      ended: null,
    }).as('getAccountBeta');
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

    cy.wait([
      '@getFeatureFlags',
      '@getAccountBeta',
      '@getLinodeTypes',
      '@getLKEClusterTypes',
    ]);

    // Enter cluster details
    cy.get('[data-qa-textfield-label="Cluster Label"]')
      .should('be.visible')
      .click();
    cy.focused().type(`${clusterLabel}{enter}`);

    ui.regionSelect.find().click().type(`${clusterRegion.label}{enter}`);

    cy.findByTestId('apl-label').should('have.text', 'Akamai App Platform');
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
  /*
   * - Confirms that DC-specific prices are present in the LKE create form.
   * - Confirms that pricing docs link is shown in "Region" section.
   * - Confirms that the plan table shows a message in place of plans when a region is not selected.
   * - Confirms that the cluster summary create button is disabled until a plan and region selection are made.
   * - Confirms that HA helper text updates dynamically to display pricing when a region is selected.
   */
  it('can dynamically update prices when creating an LKE cluster based on region', () => {
    // In staging API, only the Dallas region is available for LKE creation
    const dcSpecificPricingRegion = getRegionById('us-central');
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

    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');
    cy.wait(['@getLinodeTypes']);

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
  /**
   * - Confirms ACL flow does not exist if account doesn't have the corresponding capability
   */
  it('does not show the ACL flow without the LKE ACL capability', () => {
    mockGetAccount(
      accountFactory.build({
        capabilities: [],
      })
    ).as('getAccount');

    cy.visitWithLogin('/kubernetes/clusters');

    ui.button
      .findByTitle('Create Cluster')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/kubernetes/create');
    cy.wait(['@getAccount']);

    cy.contains('Control Plane ACL').should('not.exist');
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
      id: 'dedicated-1',
      label: 'dedicated-1',
      class: 'dedicated',
    }),
    linodeTypeFactory.build({
      id: 'dedicated-2',
      label: 'dedicated-2',
      class: 'dedicated',
    }),
  ];
  const clusterVersion = '1.31';
  const clusterPlan = { size: 2, tab: 'Dedicated CPU', type: 'Dedicated' };
  const nodeCount = 1;
  const planName = 'dedicated-1';
  const checkoutName = 'dedicated-1 Plan';

  describe('with LKE IPACL account capability', () => {
    beforeEach(() => {
      mockGetAccount(
        accountFactory.build({
          capabilities: [
            'LKE HA Control Planes',
            'LKE Network Access Control List (IP ACL)',
          ],
        })
      ).as('getAccount');
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
          'revision-id': '',
        },
      });
      const mockCluster = kubernetesClusterFactory.build({
        label: clusterLabel,
        region: mockRegion.id,
        k8s_version: clusterVersion,
        control_plane: mockACL,
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
      cy.wait(['@getAccount', '@getRegions', '@getLinodeTypes']);

      // Fill out LKE creation form label, region, and Kubernetes version fields.
      cy.findByLabelText('Cluster Label').should('be.visible').click();
      cy.focused().type(`${clusterLabel}{enter}`);

      ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);
      cy.wait(['@getRegionAvailability']);

      cy.findByText('Kubernetes Version').should('be.visible').click();
      cy.focused().type(`${clusterVersion}{enter}`);

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
      const mockACLOptions = kubernetesControlPlaneACLOptionsFactory.build({
        'revision-id': '',
      });

      const mockACL = kubernetesControlPlaneACLFactory.build({
        acl: mockACLOptions,
      });

      const mockCluster = kubernetesClusterFactory.build({
        label: clusterLabel,
        region: mockRegion.id,
        k8s_version: clusterVersion,
        control_plane: mockACL,
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
      cy.wait(['@getAccount']);

      // Fill out LKE creation form label, region, and Kubernetes version fields.
      cy.findByLabelText('Cluster Label').should('be.visible').click();
      cy.focused().type(`${clusterLabel}{enter}`);

      ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);

      cy.findByText('Kubernetes Version').should('be.visible').click();
      cy.focused().type(`${clusterVersion}{enter}`);

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
        .should('be.enabled');
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
      cy.wait(['@getAccount']);

      // Fill out LKE creation form label, region, and Kubernetes version fields.
      cy.findByLabelText('Cluster Label').should('be.visible').click();
      cy.focused().type(`${clusterLabel}{enter}`);

      ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);

      cy.findByText('Kubernetes Version').should('be.visible').click();
      cy.focused().type(`${clusterVersion}{enter}`);

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
      lkeEnterprise: { enabled: false, la: false },
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
        lkeEnterprise: { enabled: true, la: true },
      }).as('getFeatureFlags');
    });

    /**
     * - Mocks the LKE-E capability
     * - Confirms the Cluster Tier selection can be made
     * - Confirms that HA is enabled by default with LKE-E selection
     * - Confirms an LKE-E supported region can be selected
     * - Confirms an LKE-E supported k8 version can be selected
     * - Confirms at least one IP must be provided for ACL
     * - Confirms the checkout bar displays the correct LKE-E info
     * - Confirms an enterprise cluster can be created with the correct chip, version, and price
     * - Confirms that the total node count for each pool is displayed
     */
    it('creates an LKE-E cluster with the account capability', () => {
      const clusterLabel = randomLabel();
      const mockedEnterpriseCluster = kubernetesClusterFactory.build({
        label: clusterLabel,
        region: 'us-iad',
        tier: 'enterprise',
        k8s_version: latestEnterpriseTierKubernetesVersion.id,
      });
      const mockedEnterpriseClusterPools = [nanodeMemoryPool, dedicatedCpuPool];

      mockGetAccount(
        accountFactory.build({
          capabilities: [
            'Kubernetes Enterprise',
            'LKE HA Control Planes',
            'LKE Network Access Control List (IP ACL)',
          ],
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
      mockGetDashboardUrl(mockedEnterpriseCluster.id).as('getDashboardUrl');
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
          cy.findByText('$144.00').should('be.visible');
          cy.findByText('Linode 2 GB Plan').should('be.visible');
          cy.findByText('$15.00').should('be.visible');
          cy.findByText('$459.00').should('be.visible');

          // Try to submit the form
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm error validation requires an ACL IP
      cy.findByText(
        'At least one IP address or CIDR range is required for LKE Enterprise.'
      ).should('be.visible');

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

      cy.findByText(
        'At least one IP address or CIDR range is required for LKE Enterprise.'
      ).should('not.exist');

      // Wait for LKE cluster to be created and confirm that we are redirected
      // to the cluster summary page.
      cy.wait([
        '@getCluster',
        '@getClusterPools',
        '@createCluster',
        '@getLKEEnterpriseClusterTypes',
        '@getLinodeTypes',
        '@getDashboardUrl',
        '@getApiEndpoints',
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
      cy.findByText('$459.00/month').should('be.visible');

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
