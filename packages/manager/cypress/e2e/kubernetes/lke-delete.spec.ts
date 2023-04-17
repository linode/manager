// import { KubernetesCluster } from '@linode/api-v4';
import { kubernetesClusterFactory } from 'src/factories';
import { mockGetClusters, mockDeleteCluster } from 'support/intercepts/lke';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

const deletionWarning = `Deleting a cluster is permanent and can't be undone.`;

describe('LKE cluster deletion', () => {
  /*
   * -
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
    ui.dialog
      .findByTitle(`Delete Cluster ${mockCluster.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByText(deletionWarning, { exact: false }).should('be.visible');
        cy.findByLabelText('Cluster Name')
          .should('be.visible')
          .click()
          .type(mockCluster.label);

        ui.buttonGroup
          .findButtonByTitle('Delete Cluster')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

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

  // it('can delete an LKE cluster from landing page', () => {

  // });
});
