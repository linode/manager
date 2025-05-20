import { regionFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetCluster,
  mockGetClusterPools,
  mockGetClusters,
  mockGetKubeconfig,
  mockGetKubernetesVersions,
  mockGetTieredKubernetesVersions,
  mockRecycleAllNodes,
  mockUpdateCluster,
} from 'support/intercepts/lke';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { readDownload } from 'support/util/downloads';
import { getRegionById } from 'support/util/regions';

import {
  accountFactory,
  kubernetesClusterFactory,
  nodePoolFactory,
} from 'src/factories';

import type { KubernetesCluster } from '@linode/api-v4';

const mockRegion = regionFactory.build({
  id: 'us-central',
  label: 'Dallas, TX',
  capabilities: ['Linodes', 'Disk Encryption'],
});
describe('LKE landing page', () => {
  it('does not display a Disk Encryption info banner if the LDE feature is disabled', () => {
    // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
    mockAppendFeatureFlags({
      linodeDiskEncryption: false,
    }).as('getFeatureFlags');

    // Mock responses
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Disk Encryption'],
    });

    const mockCluster = kubernetesClusterFactory.build();

    mockGetAccount(mockAccount).as('getAccount');
    mockGetClusters([mockCluster]).as('getClusters');

    // Intercept request
    cy.visitWithLogin('/kubernetes/clusters');
    cy.wait(['@getClusters', '@getAccount']);

    // Wait for page to load before confirming that banner is not present.
    cy.findByText(mockCluster.label).should('be.visible');
    cy.findByText('Disk encryption is now standard on Linodes.').should(
      'not.exist'
    );
  });

  it('displays a Disk Encryption info banner if the LDE feature is enabled', () => {
    // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
    mockAppendFeatureFlags({
      linodeDiskEncryption: true,
    }).as('getFeatureFlags');

    // Mock responses
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Disk Encryption'],
    });
    const mockClusters = kubernetesClusterFactory.buildList(3, {
      region: mockRegion.id,
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetClusters(mockClusters).as('getClusters');
    mockGetRegions([mockRegion]).as('getRegions');

    // Intercept request
    cy.visitWithLogin('/kubernetes/clusters');
    cy.wait(['@getClusters', '@getAccount', '@getRegions']);

    // Check if banner is visible
    cy.contains('Disk encryption is now standard on Linodes.').should(
      'be.visible'
    );
  });

  /*
   * - Confirms that LKE clusters are listed on landing page.
   */
  it('lists LKE clusters', () => {
    const mockClusters = kubernetesClusterFactory.buildList(10, {
      region: mockRegion.id,
    });
    mockGetClusters(mockClusters).as('getClusters');

    mockClusters.forEach((cluster: KubernetesCluster) => {
      mockGetClusterPools(cluster.id, nodePoolFactory.buildList(3));
    });

    mockGetRegions([mockRegion]).as('getRegions');
    cy.visitWithLogin('/kubernetes/clusters');
    cy.wait(['@getClusters', '@getRegions']);

    mockClusters.forEach((cluster: KubernetesCluster) => {
      cy.findByText(cluster.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText(
            getRegionById(cluster.region, [mockRegion]).label
          ).should('be.visible');
          cy.findByText(cluster.k8s_version).should('be.visible');

          ui.button
            .findByTitle('Download kubeconfig')
            .should('be.visible')
            .should('be.enabled');

          ui.button
            .findByTitle('Delete')
            .should('be.visible')
            .should('be.enabled');
        });
    });
  });

  /*
   * - Confirms that welcome page is shown when no LKE clusters exist.
   * - Confirms that core page elements (create button, guides, playlist, etc.) are present.
   */
  it('shows welcome page when there are no LKE clusters', () => {
    mockGetClusters([]).as('getClusters');
    cy.visitWithLogin('/kubernetes/clusters');
    cy.wait('@getClusters');

    cy.findByText('Fully managed Kubernetes infrastructure').should(
      'be.visible'
    );

    ui.button
      .findByTitle('Create Cluster')
      .should('be.visible')
      .should('be.enabled');

    cy.findByText('Getting Started Guides').should('be.visible');
    cy.findByText('Video Playlist').should('be.visible');
  });

  /*
   * - Confirms UI flow for Kubeconfig file downloading using mocked data.
   * - Confirms that downloaded Kubeconfig contains expected content.
   */
  it('can download kubeconfig', () => {
    const mockCluster = kubernetesClusterFactory.build();
    const mockClusterNodePools = nodePoolFactory.buildList(2);
    const mockKubeconfigFilename = `${mockCluster.label}-kubeconfig.yaml`;
    const mockKubeconfigContents = '---'; // Valid YAML.
    const mockKubeconfigResponse = {
      kubeconfig: btoa(mockKubeconfigContents),
    };

    mockGetClusters([mockCluster]).as('getClusters');
    mockGetClusterPools(mockCluster.id, mockClusterNodePools).as(
      'getNodePools'
    );
    mockGetKubeconfig(mockCluster.id, mockKubeconfigResponse).as(
      'getKubeconfig'
    );

    cy.visitWithLogin('/kubernetes/clusters');
    cy.wait(['@getClusters', '@getNodePools']);

    cy.findByText(mockCluster.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Download kubeconfig')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@getKubeconfig');
    readDownload(mockKubeconfigFilename).should('eq', mockKubeconfigContents);
  });

  it('does not show an Upgrade chip when there is no new kubernetes standard version', () => {
    const oldVersion = '1.25';
    const newVersion = '1.26';

    const cluster = kubernetesClusterFactory.build({
      k8s_version: newVersion,
    });

    mockGetClusters([cluster]).as('getClusters');
    mockGetKubernetesVersions([newVersion, oldVersion]).as('getVersions');

    cy.visitWithLogin(`/kubernetes/clusters`);

    cy.wait(['@getClusters', '@getVersions']);

    cy.findByText(newVersion).should('be.visible');

    cy.findByText('UPGRADE').should('not.exist');
  });

  it('does not show an Upgrade chip when there is no new kubernetes enterprise version', () => {
    const oldVersion = '1.31.1+lke1';
    const newVersion = '1.32.1+lke2';

    mockGetAccount(
      accountFactory.build({
        capabilities: ['Kubernetes Enterprise'],
      })
    ).as('getAccount');

    // TODO LKE-E: Remove once feature is in GA
    mockAppendFeatureFlags({
      lkeEnterprise: { enabled: true, la: true },
    });

    const cluster = kubernetesClusterFactory.build({
      k8s_version: newVersion,
      tier: 'enterprise',
    });

    mockGetClusters([cluster]).as('getClusters');
    mockGetTieredKubernetesVersions('enterprise', [
      { id: newVersion, tier: 'enterprise' },
      { id: oldVersion, tier: 'enterprise' },
    ]).as('getTieredVersions');

    cy.visitWithLogin(`/kubernetes/clusters`);

    cy.wait(['@getAccount', '@getClusters', '@getTieredVersions']);

    cy.findByText(newVersion).should('be.visible');

    cy.findByText('UPGRADE').should('not.exist');
  });

  it('can upgrade the standard kubernetes version from the landing page', () => {
    const oldVersion = '1.25';
    const newVersion = '1.26';

    const cluster = kubernetesClusterFactory.build({
      k8s_version: oldVersion,
    });

    const updatedCluster = { ...cluster, k8s_version: newVersion };

    mockGetCluster(cluster).as('getCluster');
    mockGetClusters([cluster]).as('getClusters');
    mockGetKubernetesVersions([newVersion, oldVersion]).as('getVersions');
    mockUpdateCluster(cluster.id, updatedCluster).as('updateCluster');
    mockRecycleAllNodes(cluster.id).as('recycleAllNodes');

    cy.visitWithLogin(`/kubernetes/clusters`);

    cy.wait(['@getClusters', '@getVersions']);

    cy.findByText(oldVersion).should('be.visible');

    cy.findByText('UPGRADE').should('be.visible').should('be.enabled').click();

    cy.wait(['@getCluster']);

    ui.dialog
      .findByTitle(
        `Upgrade Kubernetes version to ${newVersion} on ${cluster.label}?`
      )
      .should('be.visible');

    mockGetClusters([updatedCluster]).as('getClusters');

    ui.button
      .findByTitle('Upgrade Version')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait(['@updateCluster', '@getClusters']);

    ui.dialog.findByTitle('Upgrade complete').should('be.visible');

    ui.button
      .findByTitle('Recycle All Nodes')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@recycleAllNodes');

    ui.toast.assertMessage('Recycle started successfully.');

    cy.findByText(newVersion).should('be.visible');
  });

  it('can upgrade the enterprise kubernetes version from the landing page', () => {
    const oldVersion = '1.31.1+lke1';
    const newVersion = '1.32.1+lke2';

    mockGetAccount(
      accountFactory.build({
        capabilities: ['Kubernetes Enterprise'],
      })
    ).as('getAccount');

    // TODO LKE-E: Remove once feature is in GA
    mockAppendFeatureFlags({
      lkeEnterprise: { enabled: true, la: true },
    });

    const cluster = kubernetesClusterFactory.build({
      k8s_version: oldVersion,
      tier: 'enterprise',
    });

    const updatedCluster = { ...cluster, k8s_version: newVersion };

    mockGetCluster(cluster).as('getCluster');
    mockGetClusters([cluster]).as('getClusters');
    mockGetTieredKubernetesVersions('enterprise', [
      { id: newVersion, tier: 'enterprise' },
      { id: oldVersion, tier: 'enterprise' },
    ]).as('getTieredVersions');
    mockUpdateCluster(cluster.id, updatedCluster).as('updateCluster');
    mockRecycleAllNodes(cluster.id).as('recycleAllNodes');

    cy.visitWithLogin(`/kubernetes/clusters`);

    cy.wait(['@getAccount', '@getClusters', '@getTieredVersions']);

    cy.findByText(oldVersion).should('be.visible');

    cy.findByText('UPGRADE').should('be.visible').should('be.enabled').click();

    cy.wait(['@getCluster']);

    ui.dialog
      .findByTitle(
        `Upgrade Kubernetes version to ${newVersion} on ${cluster.label}?`
      )
      .should('be.visible');

    mockGetClusters([updatedCluster]).as('getClusters');

    ui.button
      .findByTitle('Upgrade Version')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait(['@updateCluster', '@getClusters']);

    ui.dialog.findByTitle('Upgrade complete').should('be.visible');

    ui.button
      .findByTitle('Recycle All Nodes')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@recycleAllNodes');

    ui.toast.assertMessage('Recycle started successfully.');

    cy.findByText(newVersion).should('be.visible');
  });
});
