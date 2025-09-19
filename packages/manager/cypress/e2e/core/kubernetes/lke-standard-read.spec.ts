/**
 * Confirms read operations on LKE standard clusters.
 */

import { linodeFactory, profileFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodes } from 'support/intercepts/linodes';
import {
  mockGetCluster,
  mockGetClusterPools,
  mockGetKubernetesVersions,
} from 'support/intercepts/lke';
import { mockGetProfile } from 'support/intercepts/profile';

import {
  accountFactory,
  kubeLinodeFactory,
  kubernetesClusterFactory,
  nodePoolFactory,
} from 'src/factories';

const mockProfile = profileFactory.build();

const mockCluster = kubernetesClusterFactory.build({
  id: 3,
  tier: 'standard',
  vpc_id: undefined,
  subnet_id: undefined,
});

const mockNodePools = [
  nodePoolFactory.build({
    id: 2,
    nodes: [kubeLinodeFactory.build()],
    count: 1,
  }),
];

const mockLinodes = mockNodePools.map((pool, i) =>
  linodeFactory.build({
    id: pool.nodes[i].instance_id ?? undefined,
    lke_cluster_id: mockCluster.id,
    type: pool.type,
  })
);

/**
 * Confirms the expected information is displayed in the cluster summary section of the cluster details page.
 */
describe('LKE Cluster Summary', () => {
  it('does not show linked VPC in summary for a standard cluster', () => {
    // TODO LKE-E: Remove once feature is in GA
    mockAppendFeatureFlags({
      lkeEnterprise2: {
        enabled: true,
        la: true,
        phase2Mtc: { byoVPC: true, dualStack: false },
      },
    });
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Kubernetes Enterprise'],
      })
    ).as('getAccount');

    mockGetCluster(mockCluster).as('getCluster');
    mockGetKubernetesVersions().as('getVersions');
    mockGetClusterPools(mockCluster.id, []).as('getNodePools');
    mockGetProfile(mockProfile).as('getProfile');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
    cy.wait(['@getCluster', '@getNodePools', '@getVersions', '@getProfile']);

    // Confirm that no VPC label or link is shown in the summary section
    cy.get('[data-qa-kube-entity-footer]').within(() => {
      cy.contains('VPC:').should('not.exist');
      cy.findByTestId('assigned-lke-cluster-label').should('not.exist');
    });
  });
});

/**
 * Confirms the expected information is shown for a cluster's node pools on the cluster details page.
 */
describe('LKE Node Pools', () => {
  /**
   * Confirms standard LKE clusters do not show VPC IP columns when the LKE-Enterprise Phase 2 feature flag is enabled.
   */
  it('does not show VPC IP columns for standard LKE cluster', () => {
    // TODO LKE-E: Remove once feature is in GA
    mockAppendFeatureFlags({
      lkeEnterprise2: {
        enabled: true,
        la: true,
        phase2Mtc: { byoVPC: true, dualStack: false },
      },
    });
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Kubernetes Enterprise'],
      })
    ).as('getAccount');

    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockGetKubernetesVersions().as('getVersions');
    mockGetProfile(profileFactory.build()).as('getProfile');
    mockGetLinodes(mockLinodes).as('getLinodes');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
    cy.wait(['@getCluster', '@getNodePools', '@getVersions', '@getProfile']);

    // Confirm VPC IP columns are not present in the node table
    cy.get('[aria-label="List of Your Cluster Nodes"] thead').within(() => {
      cy.contains('th', 'VPC IPv4').should('not.exist');
      cy.contains('th', 'VPC IPv6').should('not.exist');
    });
  });
});
