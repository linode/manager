import { dcPricingMockLinodeTypes } from 'support/constants/dc-specific-pricing';
import { mockGetLinodeTypes } from 'support/intercepts/linodes';
import {
  mockCreateCluster,
  mockGetApiEndpoints,
  mockGetCluster,
  mockGetClusterPools,
  mockGetClusters,
  mockGetControlPlaneACL,
  mockGetDashboardUrl,
} from 'support/intercepts/lke';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  dedicatedTypeFactory,
  kubeLinodeFactory,
  kubernetesClusterFactory,
  kubernetesControlPlaneACLFactory,
  linodeTypeFactory,
  nodePoolFactory,
} from 'src/factories';
import { getTotalClusterMemoryCPUAndStorage } from 'src/features/Kubernetes/kubeUtils';
import { getTotalClusterPrice } from 'src/utilities/pricing/kubernetes';

import type { KubeNodePoolResponse, KubernetesCluster } from '@linode/api-v4';
import type { ExtendedType } from 'src/utilities/extendType';
import type { LkePlanDescription } from 'support/api/lke';

interface MockedLKEClusterOptions {
  /** Label for the cluster to create. */
  label?: string;
  /** Cluster plans to use when creating the cluster. */
  plans?: LkePlanDescription[];
  /** Node pools to use when creating the cluster. */
  pools?: KubeNodePoolResponse[];
  /** Linode types to use when creating the cluster. */
  types?: ExtendedType[];
  /** Kubernetes version to use when creating the cluster. */
  version?: string;
}

const dedicatedNodeCount = 4;
const nanodeNodeCount = 3;

export const clusterRegion = chooseRegion({
  capabilities: ['Kubernetes'],
});
export const dedicatedCpuPool = nodePoolFactory.build({
  count: dedicatedNodeCount,
  nodes: kubeLinodeFactory.buildList(dedicatedNodeCount),
  type: 'g6-dedicated-2',
});
export const nanodeMemoryPool = nodePoolFactory.build({
  count: nanodeNodeCount,
  nodes: kubeLinodeFactory.buildList(nanodeNodeCount),
  type: 'g6-nanode-1',
});
export const dedicatedType = dedicatedTypeFactory.build({
  disk: 81920,
  id: 'g6-dedicated-2',
  label: 'Dedicated 4 GB',
  memory: 4096,
  region_prices: dcPricingMockLinodeTypes.find(
    (type) => type.id === 'g6-dedicated-2'
  )?.region_prices,
  vcpus: 2,
}) as ExtendedType;
export const nanodeType = linodeTypeFactory.build({
  disk: 25600,
  id: 'g6-nanode-1',
  label: 'Linode 2 GB',
  memory: 2048,
  region_prices: dcPricingMockLinodeTypes.find(
    (type) => type.id === 'g6-nanode-1'
  )?.region_prices,
  vcpus: 1,
}) as ExtendedType;

export const createMockedLKECluster = async ({
  label,
  plans,
  pools,
  types,
  version,
}: MockedLKEClusterOptions): Promise<KubernetesCluster> => {
  const clusterLabel = label || randomLabel();
  const clusterVersion = version || '1.27';
  const clusterPlans: LkePlanDescription[] = plans || [
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
  const mockedLKECluster = kubernetesClusterFactory.build({
    label: clusterLabel,
    region: clusterRegion.id,
  });
  const mockedLKEClusterPools = pools || [nanodeMemoryPool, dedicatedCpuPool];
  const mockedLKEClusterControlPlane = kubernetesControlPlaneACLFactory.build();
  const mockedLKEClusterTypes = types || [dedicatedType, nanodeType];
  const {
    CPU: totalCpu,
    RAM: totalMemory,
    Storage: totalStorage,
  } = getTotalClusterMemoryCPUAndStorage(
    mockedLKEClusterPools,
    mockedLKEClusterTypes
  );

  mockCreateCluster(mockedLKECluster).as('createCluster');
  mockGetCluster(mockedLKECluster).as('getCluster');
  mockGetClusterPools(mockedLKECluster.id, mockedLKEClusterPools).as(
    'getClusterPools'
  );
  mockGetDashboardUrl(mockedLKECluster.id).as('getDashboardUrl');
  mockGetControlPlaneACL(mockedLKECluster.id, mockedLKEClusterControlPlane).as(
    'getControlPlaneACL'
  );
  mockGetApiEndpoints(mockedLKECluster.id).as('getApiEndpoints');
  mockGetLinodeTypes([dedicatedType, nanodeType]).as('getLinodeTypes');
  mockGetClusters([mockedLKECluster]).as('getClusters');

  cy.visitWithLogin('/kubernetes/clusters');

  ui.button
    .findByTitle('Create Cluster')
    .should('be.visible')
    .should('be.enabled')
    .click();

  cy.url().should('endWith', '/kubernetes/create');

  // Fill out LKE creation form label, region, and Kubernetes version fields.
  const labelInput = '[data-qa-textfield-label="Cluster Label"]';
  cy.get(labelInput).should('be.visible');
  cy.get(labelInput).click();
  cy.get(labelInput).type(`${clusterLabel}{enter}`);

  ui.regionSelect.find().click().type(`${clusterRegion.label}{enter}`);

  ui.autocomplete
    .findByLabel('Kubernetes Version')
    .click()
    .type(`${clusterVersion}{enter}`);

  cy.get('[data-testid="ha-radio-button-yes"]').should('be.visible').click();

  let monthPrice = 0;

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
      highAvailabilityPrice: 60,
      pools: [nanodeMemoryPool, dedicatedCpuPool],
      region: clusterRegion.id,
      types: [nanodeType, dedicatedType],
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
  cy.wait('@createCluster');
  cy.wait('@getCluster');
  cy.wait('@getClusterPools');
  cy.wait('@getDashboardUrl');
  cy.wait('@getControlPlaneACL');
  cy.wait('@getApiEndpoints');
  cy.wait('@getLinodeTypes');
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
  });

  return mockedLKECluster;
};

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
  return clusterPlans.filter((otherClusterPlan: any) => {
    return (
      clusterPlan.type === otherClusterPlan.type &&
      clusterPlan.size === otherClusterPlan.size
    );
  });
};
