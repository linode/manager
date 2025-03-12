import {
  mockDeleteCluster,
  mockGetCluster,
  mockGetClusters,
} from 'support/intercepts/lke';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

import { kubernetesClusterFactory } from 'src/factories';

/*
 * Fills out and submits Type to Confirm deletion dialog for cluster with the given label.
 */
const completeTypeToConfirmDialog = (clusterLabel: string) => {
  const deletionWarning = `Deleting a cluster is permanent and can't be undone.`;

  ui.dialog
    .findByTitle(`Delete Cluster ${clusterLabel}`)
    .should('be.visible')
    .within(() => {
      cy.findByText(deletionWarning, { exact: false }).should('be.visible');
      cy.findByLabelText('Cluster Name').should('be.visible').click();
      cy.focused().type(clusterLabel);

      ui.buttonGroup
        .findButtonByTitle('Delete Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
};

describe('LKE cluster deletion', () => {
  /*
   * - Confirms LKE cluster deletion flow via landing page.
   * - Confirms that landing page updates to reflect deleted cluster.
   */
  it('can delete an LKE cluster from summary page', () => {
    const mockCluster = kubernetesClusterFactory.build({
      label: randomLabel(),
    });

    mockGetClusters([mockCluster]).as('getClusters');
    mockDeleteCluster(mockCluster.id).as('deleteCluster');
    cy.visitWithLogin('/kubernetes/clusters');
    cy.wait('@getClusters');

    // Find mock cluster in table, click its "Delete" button.
    cy.findByText(mockCluster.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.enabled')
          .should('be.visible')
          .click();
      });

    // Fill out and submit type-to-confirm.
    mockGetClusters([]).as('getClusters');
    completeTypeToConfirmDialog(mockCluster.label);

    // Confirm that cluster is no longer listed on landing page.
    cy.wait(['@deleteCluster', '@getClusters']);
    cy.findByText(mockCluster.label).should('not.exist');

    // Confirm that Kubernetes welcome page is shown when there are no clusters.
    cy.findByText('Fully managed Kubernetes infrastructure').should(
      'be.visible'
    );

    ui.button
      .findByTitle('Create Cluster')
      .should('be.visible')
      .should('be.enabled');
  });

  /*
   * - Confirms LKE cluster deletion flow via details page.
   * - Confirms that user is redirected to landing page upon cluster deletion.
   */
  it('can delete an LKE cluster from landing page', () => {
    const mockCluster = kubernetesClusterFactory.build({
      label: randomLabel(),
    });

    // Navigate to details page for mocked LKE cluster.
    mockGetCluster(mockCluster).as('getCluster');
    mockDeleteCluster(mockCluster.id).as('deleteCluster');
    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
    cy.wait('@getCluster');

    // Press "Delete Cluster" button, complete type-to-confirm, and confirm redirect.
    ui.button
      .findByTitle('Delete Cluster')
      .should('be.visible')
      .should('be.enabled')
      .click();

    completeTypeToConfirmDialog(mockCluster.label);
    cy.wait('@deleteCluster');
    cy.url().should('endWith', 'kubernetes/clusters');
  });
});
