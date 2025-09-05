/**
 * Tests basic functionality for LKE-E feature-flagged work.
 * TODO: M3-10365 - Add `postLa` smoke tests to this file.
 * TODO: M3-8838 - Delete this spec file once LKE-E is released to GA.
 */

import { regionFactory } from '@linode/utilities';
import {
  accountFactory,
  kubernetesClusterFactory,
  nodePoolFactory,
  subnetFactory,
  vpcFactory,
} from '@src/factories';
import {
  latestEnterpriseTierKubernetesVersion,
  minimumNodeNotice,
} from 'support/constants/lke';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateCluster,
  mockGetCluster,
  mockGetClusterPools,
  mockGetTieredKubernetesVersions,
} from 'support/intercepts/lke';
import { mockGetClusters } from 'support/intercepts/lke';
import {} from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVPC } from 'support/intercepts/vpc';
import { ui } from 'support/ui';
import { addNodes } from 'support/util/lke';
import { randomLabel } from 'support/util/random';

const mockCluster = kubernetesClusterFactory.build({
  id: 1,
  vpc_id: 123,
  label: randomLabel(),
  tier: 'enterprise',
});

const mockVPC = vpcFactory.build({
  id: 123,
  label: 'lke-e-vpc',
  subnets: [subnetFactory.build()],
});

const mockNodePools = [nodePoolFactory.build()];

// Mock a valid region for LKE-E to avoid test flake.
const mockRegions = [
  regionFactory.build({
    capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise', 'VPCs'],
    id: 'us-iad',
    label: 'Washington, DC',
  }),
];

/**
 * - Confirms VPC and IP Stack selections are shown with `phase2Mtc` feature flag is enabled.
 * - Confirms VPC and IP Stack selections are not shown in create flow with `phase2Mtc` feature flag is disabled.
 */
describe('LKE-E Cluster Create', () => {
  beforeEach(() => {
    mockGetAccount(
      accountFactory.build({
        capabilities: [
          'Kubernetes Enterprise',
          'Kubernetes Enterprise BYO VPC',
          'Kubernetes Enterprise Dual Stack',
        ],
      })
    ).as('getAccount');
  });

  it('Simple Page Check - Phase 2 MTC Flag ON', () => {
    mockAppendFeatureFlags({
      lkeEnterprise2: {
        enabled: true,
        la: true,
        postLa: false,
        phase2Mtc: { byoVPC: true, dualStack: true },
      },
    }).as('getFeatureFlags');

    mockCreateCluster(mockCluster).as('createCluster');
    mockGetTieredKubernetesVersions('enterprise', [
      latestEnterpriseTierKubernetesVersion,
    ]).as('getTieredKubernetesVersions');
    mockGetRegions(mockRegions);

    cy.visitWithLogin('/kubernetes/create');
    cy.findByText('Add Node Pools').should('be.visible');

    cy.findByLabelText('Cluster Label').click();
    cy.focused().type(mockCluster.label);

    cy.findByText('LKE Enterprise').click();

    ui.regionSelect.find().click().type(`${mockRegions[0].label}`);
    ui.regionSelect.findItemByRegionId(mockRegions[0].id).click();

    cy.findByLabelText('Kubernetes Version').should('be.visible').click();
    cy.findByText(latestEnterpriseTierKubernetesVersion.id)
      .should('be.visible')
      .click();

    // Confirms LKE-E Phase 2 IP Stack and VPC options display with the flag ON.
    cy.findByText('IP Stack').should('be.visible');
    cy.findByText('IPv4', { exact: true }).should('be.visible');
    cy.findByText('IPv4 + IPv6 (dual-stack)').should('be.visible');
    cy.findByText('Automatically generate a VPC for this cluster').should(
      'be.visible'
    );
    cy.findByText('Use an existing VPC').should('be.visible');

    cy.findByText('Shared CPU').should('be.visible').click();
    addNodes('Linode 2 GB');

    // Bypass ACL validation
    cy.get('input[name="acl-acknowledgement"]').check();

    // Confirm change is reflected in checkout bar.
    cy.get('[data-testid="kube-checkout-bar"]').within(() => {
      cy.findByText('Linode 2 GB Plan').should('be.visible');
      cy.findByTitle('Remove Linode 2GB Node Pool').should('be.visible');

      cy.get('[data-qa-notice="true"]').within(() => {
        cy.findByText(minimumNodeNotice).should('be.visible');
      });

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.wait('@createCluster');
    cy.url().should(
      'endWith',
      `/kubernetes/clusters/${mockCluster.id}/summary`
    );
  });

  it('Simple Page Check - Phase 2 MTC Flag OFF', () => {
    mockAppendFeatureFlags({
      lkeEnterprise2: {
        enabled: true,
        la: true,
        postLa: false,
        phase2Mtc: { byoVPC: false, dualStack: false },
      },
    }).as('getFeatureFlags');

    mockCreateCluster(mockCluster).as('createCluster');
    mockGetTieredKubernetesVersions('enterprise', [
      latestEnterpriseTierKubernetesVersion,
    ]).as('getTieredKubernetesVersions');
    mockGetRegions(mockRegions);

    cy.visitWithLogin('/kubernetes/create');
    cy.findByText('Add Node Pools').should('be.visible');

    cy.findByLabelText('Cluster Label').click();
    cy.focused().type(mockCluster.label);

    cy.findByText('LKE Enterprise').click();

    ui.regionSelect.find().click().type(`${mockRegions[0].label}`);
    ui.regionSelect.findItemByRegionId(mockRegions[0].id).click();

    cy.findByLabelText('Kubernetes Version').should('be.visible').click();
    cy.findByText(latestEnterpriseTierKubernetesVersion.id)
      .should('be.visible')
      .click();

    // Confirms LKE-E Phase 2 IP Stack and VPC options do not display with the flag OFF.
    cy.findByText('IP Stack').should('not.exist');
    cy.findByText('IPv4', { exact: true }).should('not.exist');
    cy.findByText('IPv4 + IPv6 (dual-stack)').should('not.exist');
    cy.findByText('Automatically generate a VPC for this cluster').should(
      'not.exist'
    );
    cy.findByText('Use an existing VPC').should('not.exist');

    cy.findByText('Shared CPU').should('be.visible').click();
    addNodes('Linode 2 GB');

    // Bypass ACL validation
    cy.get('input[name="acl-acknowledgement"]').check();

    // Confirm change is reflected in checkout bar.
    cy.get('[data-testid="kube-checkout-bar"]').within(() => {
      cy.findByText('Linode 2 GB Plan').should('be.visible');
      cy.findByTitle('Remove Linode 2GB Node Pool').should('be.visible');

      cy.get('[data-qa-notice="true"]').within(() => {
        cy.findByText(minimumNodeNotice).should('be.visible');
      });

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.wait('@createCluster');
    cy.url().should(
      'endWith',
      `/kubernetes/clusters/${mockCluster.id}/summary`
    );
  });
});

/**
 * - Confirms cluster shows linked VPC and Node Pool VPC IP columns when `phase2Mtc` flag is enabled.
 * - Confirms cluster's linked VPC and Node Pool VPC IP columns are hidden when `phase2Mtc` flag is disabled.
 */
describe('LKE-E Cluster Read', () => {
  beforeEach(() => {
    mockGetAccount(
      accountFactory.build({
        capabilities: [
          'Kubernetes Enterprise',
          'Kubernetes Enterprise BYO VPC',
          'Kubernetes Enterprise Dual Stack',
        ],
      })
    ).as('getAccount');
  });

  it('Simple Page Check - Phase 2 MTC Flag ON', () => {
    mockAppendFeatureFlags({
      lkeEnterprise2: {
        enabled: true,
        la: true,
        phase2Mtc: { byoVPC: true, dualStack: true },
      },
    }).as('getFeatureFlags');

    mockGetClusters([mockCluster]).as('getClusters');
    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockGetVPC(mockVPC).as('getVPC');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
    cy.wait(['@getCluster', '@getVPC', '@getNodePools']);

    // Confirm linked VPC is present
    cy.get('[data-qa-kube-entity-footer]').within(() => {
      cy.contains('VPC:').should('exist');
      cy.findByTestId('assigned-lke-cluster-label').should(
        'contain.text',
        mockVPC.label
      );
    });

    // Confirm VPC IP columns are present in the node table header
    cy.get('[aria-label="List of Your Cluster Nodes"] thead').within(() => {
      cy.contains('th', 'VPC IPv4').should('be.visible');
      cy.contains('th', 'VPC IPv6').should('be.visible');
    });
  });

  it('Simple Page Check - Phase 2 MTC Flag OFF', () => {
    mockAppendFeatureFlags({
      lkeEnterprise2: {
        enabled: true,
        la: true,
        phase2Mtc: { byoVPC: false, dualStack: false },
      },
    }).as('getFeatureFlags');

    mockGetClusters([mockCluster]).as('getClusters');
    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
    cy.wait(['@getCluster', '@getNodePools']);

    // Confirm linked VPC is not present
    cy.get('[data-qa-kube-entity-footer]').within(() => {
      cy.contains('VPC:').should('not.exist');
      cy.findByTestId('assigned-lke-cluster-label').should('not.exist');
    });

    // Confirm VPC IP columns are not present in the node table header
    cy.get('[aria-label="List of Your Cluster Nodes"] thead').within(() => {
      cy.contains('th', 'VPC IPv4').should('not.exist');
      cy.contains('th', 'VPC IPv6').should('not.exist');
    });
  });
});
