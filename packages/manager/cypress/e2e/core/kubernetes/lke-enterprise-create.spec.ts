import {
  dedicatedTypeFactory,
  linodeTypeFactory,
  pluralize,
  regionFactory,
} from '@linode/utilities';
import { dcPricingMockLinodeTypes } from 'support/constants/dc-specific-pricing';
import {
  latestEnterpriseTierKubernetesVersion,
  latestKubernetesVersion,
} from 'support/constants/lke';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeTypes } from 'support/intercepts/linodes';
import {
  mockCreateCluster,
  mockGetApiEndpoints,
  mockGetCluster,
  mockGetClusterPools,
  mockGetClusters,
  mockGetControlPlaneACL,
  mockGetKubernetesVersions,
  mockGetLKEClusterTypes,
  mockGetTieredKubernetesVersions,
} from 'support/intercepts/lke';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  accountFactory,
  kubeLinodeFactory,
  kubernetesClusterFactory,
  kubernetesControlPlaneACLFactory,
  lkeEnterpriseTypeFactory,
  lkeHighAvailabilityTypeFactory,
  nodePoolFactory,
} from 'src/factories';
import { getTotalClusterPrice } from 'src/utilities/pricing/kubernetes';

import type { ExtendedType } from 'src/utilities/extendType';
import type { LkePlanDescription } from 'support/api/lke';

const dedicatedNodeCount = 4;
const nanodeNodeCount = 3;

const clusterRegion = chooseRegion({
  capabilities: ['Kubernetes'],
  exclude: ['au-mel', 'eu-west'], // Unavailable regions
});
const mockedLKEEnterprisePrices = [
  lkeHighAvailabilityTypeFactory.build(),
  lkeEnterpriseTypeFactory.build(),
];
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
  disk: 51200,
  id: 'g6-standard-1',
  label: 'Linode 2 GB',
  memory: 2048,
  price: {
    hourly: 0.0095,
    monthly: 12.0,
  },
  region_prices: dcPricingMockLinodeTypes.find(
    (type) => type.id === 'g6-standard-1'
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
    type: 'standard',
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

/**
 * - Tests LKE-E for post-LA features with the postLa flag enabled.
 * - Confirms no regressions to LKE with the postLA flag enabled.
 */
describe('confirms LKE-E clusters can be created with node pool configuration options', () => {
  beforeEach(() => {
    // Mock feature flag -- @TODO LKE-E: Remove feature flag once LKE-E is fully rolled out
    mockAppendFeatureFlags({
      lkeEnterprise: { enabled: true, la: true, postLa: true },
    }).as('getFeatureFlags');
  });

  /**
   * - Confirms the node pool plan row shows a Configure button for LKE-E.
   * - Confirms the Configure button opens a drawer.
   * - Confirms the number input and add button have moved from the table row to the drawer.
   * - Confirms the cluster summary checkout bar display the correct information.
   * - Confirms the cluster can be created with the correct number of node pools and nodes.
   */
  it('creates an LKE-E cluster with the Post-LA flag on', () => {
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

    // Select LKE-E as the Cluster Tier
    cy.get(`[data-qa-select-card-heading="LKE Enterprise"]`)
      .closest('[data-qa-selection-card]')
      .should('be.visible')
      .should('have.attr', 'data-qa-selection-card-checked', 'false')
      .click();

    cy.wait(['@getLKEEnterpriseClusterTypes', '@getRegions']);

    // Select a supported region
    ui.regionSelect.find().clear().type('Washington, DC{enter}');

    // Selects an enterprise version
    ui.autocomplete
      .findByLabel('Kubernetes Version')
      .should('be.visible')
      .click();

    ui.autocompletePopper
      .findByTitle(latestEnterpriseTierKubernetesVersion.id)
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm the VPC/Firewall section displays.
    cy.findByText('VPC & Firewall').should('be.visible');
    cy.findByText(
      'A VPC and Firewall are automatically generated for LKE Enterprise customers.'
    ).should('be.visible');

    // Confirm the expected available plans display.
    validEnterprisePlanTabs.forEach((tab) => {
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

    // Confirm the LKE-E cluster has the correct number of nodes.
    clusterPlans.forEach((clusterPlan) => {
      // Confirm total number of nodes are shown for each pool
      cy.findAllByText(
        pluralize('Node', 'Nodes', clusterPlan.nodeCount)
      ).should('be.visible');
    });
  });
});
