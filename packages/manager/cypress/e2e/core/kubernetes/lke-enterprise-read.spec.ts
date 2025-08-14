import { profileFactory } from '@linode/utilities';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetCluster,
  mockGetClusterPools,
  mockGetKubernetesVersions,
} from 'support/intercepts/lke';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetVPC } from 'support/intercepts/vpc';

import { kubernetesClusterFactory, vpcFactory } from 'src/factories';

const mockProfile = profileFactory.build();

/**
 * Confirms read operations on LKE-Enterprise clusters.
 */
describe('LKE-E Cluster Summary - VPC Section', () => {
  beforeEach(() => {
    // TODO LKE-E: Remove once feature is in GA
    mockAppendFeatureFlags({
      lkeEnterprise: { enabled: true, la: true, phase2Mtc: true },
    });
  });
  /*
   * - Confirms LKE-E summary page shows VPC info and links to the correct VPC page when a vpc_id is present.
   */
  it('shows linked VPC in summary for cluster with a VPC', () => {
    const mockVPC = vpcFactory.build({
      id: 123,
      label: 'lke-e-vpc',
    });

    const mockClusterWithVPC = kubernetesClusterFactory.build({
      id: 1,
      vpc_id: mockVPC.id,
      tier: 'enterprise',
    });
    mockGetCluster(mockClusterWithVPC).as('getCluster');
    mockGetKubernetesVersions().as('getVersions');
    mockGetClusterPools(mockClusterWithVPC.id, []).as('getNodePools');
    mockGetVPC(mockVPC).as('getVPC');
    mockGetProfile(mockProfile).as('getProfile');

    cy.visitWithLogin(`/kubernetes/clusters/${mockClusterWithVPC.id}/summary`);
    cy.wait([
      '@getCluster',
      '@getNodePools',
      '@getVersions',
      '@getVPC',
      '@getProfile',
    ]);

    // Verify VPC details appear in the summary
    cy.get('[data-qa-kube-entity-footer]').within(() => {
      cy.contains('VPC:').should('exist');
      cy.findByTestId('assigned-lke-cluster-label')
        .should('contain.text', mockVPC.label)
        .should('have.attr', 'href')
        .and('include', `/vpcs/${mockVPC.id}`);
    });

    // Navigate to the VPC by clicking the link
    cy.findByTestId('assigned-lke-cluster-label').click();

    // Verify the VPC details page loads
    cy.url().should('include', `/vpcs/${mockVPC.id}`);
    cy.contains(mockVPC.label).should('exist');
  });

  /*
   * - Confirms VPC info is not shown when cluster's vpc_id is null.
   */
  it('does not show linked VPC in summary when cluster does not have a VPC', () => {
    const mockClusterWithoutVPC = kubernetesClusterFactory.build({
      id: 2,
      vpc_id: null,
      tier: 'enterprise',
    });

    mockGetCluster(mockClusterWithoutVPC).as('getCluster');
    mockGetKubernetesVersions().as('getVersions');
    mockGetClusterPools(mockClusterWithoutVPC.id, []).as('getNodePools');
    mockGetProfile(mockProfile).as('getProfile');

    cy.visitWithLogin(
      `/kubernetes/clusters/${mockClusterWithoutVPC.id}/summary`
    );
    cy.wait(['@getCluster', '@getNodePools', '@getVersions', '@getProfile']);

    // Confirm that no VPC label or link is shown in the summary section
    cy.get('[data-qa-kube-entity-footer]').within(() => {
      cy.contains('VPC:').should('not.exist');
      cy.findByTestId('assigned-lke-cluster-label').should('not.exist');
    });
  });
});
