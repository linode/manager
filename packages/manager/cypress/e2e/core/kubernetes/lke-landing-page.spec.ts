import type { KubernetesCluster } from '@linode/api-v4';
import {
  mockGetClusters,
  mockGetClusterPools,
  mockGetKubeconfig,
} from 'support/intercepts/lke';
import {
  accountFactory,
  kubernetesClusterFactory,
  nodePoolFactory,
} from 'src/factories';
import { getRegionById } from 'support/util/regions';
import { readDownload } from 'support/util/downloads';
import { ui } from 'support/ui';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetAccount } from 'support/intercepts/account';

describe('LKE landing page', () => {
  it('does not display a Disk Encryption info banner if the LDE feature is disabled', () => {
    // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
    mockAppendFeatureFlags({
      linodeDiskEncryption: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

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
      linodeDiskEncryption: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Mock responses
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Disk Encryption'],
    });
    const mockClusters = kubernetesClusterFactory.buildList(3);

    mockGetAccount(mockAccount).as('getAccount');
    mockGetClusters(mockClusters).as('getClusters');

    // Intercept request
    cy.visitWithLogin('/kubernetes/clusters');
    cy.wait(['@getClusters', '@getAccount']);

    // Check if banner is visible
    cy.contains('Disk encryption is now standard on Linodes.').should(
      'be.visible'
    );
  });

  /*
   * - Confirms that LKE clusters are listed on landing page.
   */
  it('lists LKE clusters', () => {
    const mockClusters = kubernetesClusterFactory.buildList(10);
    mockGetClusters(mockClusters).as('getClusters');

    mockClusters.forEach((cluster: KubernetesCluster) => {
      mockGetClusterPools(cluster.id, nodePoolFactory.buildList(3));
    });

    cy.visitWithLogin('/kubernetes/clusters');
    cy.wait('@getClusters');

    mockClusters.forEach((cluster: KubernetesCluster) => {
      cy.findByText(cluster.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText(getRegionById(cluster.region).label).should(
            'be.visible'
          );
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
});
