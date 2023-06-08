import type { KubernetesCluster } from '@linode/api-v4';
import {
  mockGetClusters,
  mockGetClusterPools,
  mockGetKubeconfig,
} from 'support/intercepts/lke';
import { kubernetesClusterFactory, nodePoolFactory } from 'src/factories';
import { getRegionById } from 'support/util/regions';
import { readDownload } from 'support/util/downloads';
import { ui } from 'support/ui';

describe('LKE landing page', () => {
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
          cy.findByText(getRegionById(cluster.region).name).should(
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
