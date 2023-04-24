import { kubernetesClusterFactory, nodePoolFactory } from 'src/factories';
import { latestKubernetesVersion } from 'support/constants/lke';
import {
  mockGetCluster,
  mockGetKubernetesVersions,
  mockGetClusterPools,
  mockResetKubeconfig,
  mockUpdateCluster,
} from 'support/intercepts/lke';
import { ui } from 'support/ui';

const mockNodePools = nodePoolFactory.buildList(2);

describe('LKE cluster updates', () => {
  /*
   * - Confirms UI flow of upgrading a cluster to high availability control plane using mocked data.
   * - Confirms that user is shown a warning and agrees to billing changes before upgrading.
   * - Confirms that details page updates accordingly after upgrading to high availability.
   */
  it('can upgrade to high availability', () => {
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
      control_plane: {
        high_availability: false,
      },
    });

    const mockClusterWithHA = {
      ...mockCluster,
      control_plane: {
        high_availability: true,
      },
    };

    const haUpgradeWarnings = [
      'All nodes will be deleted and new nodes will be created to replace them.',
      'Any local storage (such as ’hostPath’ volumes) will be erased.',
      'This may take several minutes, as nodes will be replaced on a rolling basis.',
    ];

    const haUpgradeAgreement =
      'I agree to the additional fee on my monthly bill and understand HA upgrade can only be reversed by deleting my cluster';

    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockGetKubernetesVersions().as('getVersions');
    mockUpdateCluster(mockCluster.id, mockClusterWithHA).as('updateCluster');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools', '@getVersions']);

    // Initiate high availability upgrade and agree to changes.
    ui.button
      .findByTitle('Upgrade to HA')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle('Upgrade to High Availability')
      .should('be.visible')
      .within(() => {
        haUpgradeWarnings.forEach((warning: string) => {
          cy.findByText(warning).should('be.visible');
        });

        cy.findByText(haUpgradeAgreement, { exact: false })
          .should('be.visible')
          .closest('label')
          .click();

        ui.button
          .findByTitle('Upgrade to HA')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm toast message appears and HA Cluster chip is shown.
    cy.wait('@updateCluster');
    ui.toast.assertMessage('Enabled HA Control Plane');
    cy.findByText('HA CLUSTER').should('be.visible');
    cy.findByText('Upgrade to HA').should('not.exist');
  });

  /*
   * - Confirms UI flow of upgrading Kubernetes version using mocked API requests.
   * - Confirms that Kubernetes upgrade prompt is shown when not up-to-date.
   * - Confirms that Kubernetes upgrade prompt is hidden when up-to-date.
   */
  it('can upgrade Kubernetes engine version', () => {
    const oldVersion = '1.25';
    const newVersion = '1.26';

    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: oldVersion,
    });

    const mockClusterUpdated = {
      ...mockCluster,
      k8s_version: newVersion,
    };

    const upgradePrompt = 'A new version of Kubernetes is available (1.26).';

    const upgradeNotes = [
      'Once the upgrade is complete you will need to recycle all nodes in your cluster',
      // Confirm that the old version and new version are both shown.
      oldVersion,
      newVersion,
    ];

    mockGetCluster(mockCluster).as('getCluster');
    mockGetKubernetesVersions([newVersion, oldVersion]).as('getVersions');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockUpdateCluster(mockCluster.id, mockClusterUpdated).as('updateCluster');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools', '@getVersions']);

    // Confirm that upgrade prompt is shown.
    cy.findByText(upgradePrompt).should('be.visible');
    ui.button
      .findByTitle('Upgrade Version')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle(
        `Step 1: Upgrade ${mockCluster.label} to Kubernetes ${newVersion}`
      )
      .should('be.visible')
      .within(() => {
        upgradeNotes.forEach((note: string) => {
          cy.findAllByText(note, { exact: false }).should('be.visible');
        });

        ui.button
          .findByTitle('Upgrade Version')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for API response and assert toast message is shown.
    cy.wait('@updateCluster');
    cy.findByText(upgradePrompt).should('not.exist');
  });

  it.skip('can resize pool, toggle autoscaling, and recyle nodes', () => {});

  /*
   * - Confirms kubeconfig reset UI flow using mocked API responses.
   * - Confirms that user is warned of repercussions before resetting config.
   * - Confirms that toast appears confirming kubeconfig has reset.
   */
  it('can reset kubeconfig', () => {
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
    });

    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockGetKubernetesVersions().as('getVersions');
    mockResetKubeconfig(mockCluster.id).as('resetKubeconfig');

    const resetWarnings = [
      'This will delete and regenerate the cluster’s Kubeconfig file',
      'You will no longer be able to access this cluster via your previous Kubeconfig file',
      'This action cannot be undone',
    ];

    cy.visitWithLogin(`kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools', '@getVersions']);

    // Click "Reset" button, proceed through confirmation dialog.
    cy.findByText('Reset').should('be.visible').click();
    ui.dialog
      .findByTitle('Reset Cluster Kubeconfig?')
      .should('be.visible')
      .within(() => {
        resetWarnings.forEach((warning: string) => {
          cy.findByText(warning, { exact: false }).should('be.visible');
        });

        ui.button
          .findByTitle('Reset Kubeconfig')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for API response and assert toast message appears.
    cy.wait('@resetKubeconfig');
    ui.toast.assertMessage('Successfully reset Kubeconfig');
  });

  it.skip('can add and delete node pools', () => {});
});
