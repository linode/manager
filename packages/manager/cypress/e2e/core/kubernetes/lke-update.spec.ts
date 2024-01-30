import {
  kubernetesClusterFactory,
  nodePoolFactory,
  kubeLinodeFactory,
  linodeFactory,
} from 'src/factories';
import { latestKubernetesVersion } from 'support/constants/lke';
import {
  mockGetCluster,
  mockGetKubernetesVersions,
  mockGetClusterPools,
  mockResetKubeconfig,
  mockUpdateCluster,
  mockAddNodePool,
  mockUpdateNodePool,
  mockDeleteNodePool,
  mockRecycleNode,
  mockRecycleNodePool,
  mockRecycleAllNodes,
  mockGetDashboardUrl,
  mockGetApiEndpoints,
} from 'support/intercepts/lke';
import {
  mockGetLinodeType,
  mockGetLinodeTypes,
  mockGetLinodes,
} from 'support/intercepts/linodes';
import type { PoolNodeResponse, Linode } from '@linode/api-v4';
import { ui } from 'support/ui';
import { randomIp, randomLabel } from 'support/util/random';
import { getRegionById } from 'support/util/regions';
import { dcPricingMockLinodeTypes } from 'support/constants/dc-specific-pricing';

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
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

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
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

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

    // Verify the banner goes away because the version update has happened
    cy.findByText(upgradePrompt).should('not.exist');

    mockRecycleAllNodes(mockCluster.id).as('recycleAllNodes');

    const stepTwoDialogTitle = 'Step 2: Recycle All Cluster Nodes';

    ui.dialog
      .findByTitle(stepTwoDialogTitle)
      .should('be.visible')
      .within(() => {
        cy.findByText('Kubernetes version has been updated successfully.', {
          exact: false,
        }).should('be.visible');

        cy.findByText(
          'For the changes to take full effect you must recycle the nodes in your cluster.',
          { exact: false }
        ).should('be.visible');

        ui.button
          .findByTitle('Recycle All Nodes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Verify clicking the "Recycle All Nodes" makes an API call
    cy.wait('@recycleAllNodes');

    // Verify the upgrade dialog closed
    cy.findByText(stepTwoDialogTitle).should('not.exist');

    // Verify the banner is still gone after the flow
    cy.findByText(upgradePrompt).should('not.exist');

    // Verify the version is correct after the update
    cy.findByText(`Version ${newVersion}`);

    ui.toast.findByMessage('Recycle started successfully.');
  });

  /*
   * - Confirms node, node pool, and cluster recycling UI flow using mocked API data.
   * - Confirms that user is warned that recycling recreates nodes and may take a while.
   */
  it('can recycle nodes', () => {
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
    });

    const mockKubeLinode = kubeLinodeFactory.build();

    const mockNodePool = nodePoolFactory.build({
      count: 1,
      type: 'g6-standard-1',
      nodes: [mockKubeLinode],
    });

    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      id: mockKubeLinode.instance_id ?? undefined,
    });

    const recycleWarningSubstrings = [
      'will be deleted',
      'will be created',
      'local storage (such as ’hostPath’ volumes) will be erased',
      'may take several minutes',
    ];

    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, [mockNodePool]).as('getNodePools');
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetKubernetesVersions().as('getVersions');
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools', '@getLinodes', '@getVersions']);

    // Recycle individual node.
    ui.button
      .findByTitle('Recycle')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockRecycleNode(mockCluster.id, mockKubeLinode.id).as('recycleNode');
    ui.dialog
      .findByTitle(`Recycle ${mockKubeLinode.id}?`)
      .should('be.visible')
      .within(() => {
        recycleWarningSubstrings.forEach((warning: string) => {
          cy.findByText(warning, { exact: false }).should('be.visible');
        });

        ui.button
          .findByTitle('Recycle')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@recycleNode');
    ui.toast.assertMessage('Node queued for recycling.');

    ui.button
      .findByTitle('Recycle Pool Nodes')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockRecycleNodePool(mockCluster.id, mockNodePool.id).as('recycleNodePool');
    ui.dialog
      .findByTitle('Recycle node pool?')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Recycle Pool Nodes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@recycleNodePool');
    ui.toast.assertMessage(
      `Recycled all nodes in node pool ${mockNodePool.id}`
    );

    ui.button
      .findByTitle('Recycle All Nodes')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockRecycleAllNodes(mockCluster.id).as('recycleAllNodes');
    ui.dialog
      .findByTitle('Recycle all nodes in cluster?')
      .should('be.visible')
      .within(() => {
        recycleWarningSubstrings.forEach((warning: string) => {
          cy.findByText(warning, { exact: false }).should('be.visible');
        });

        ui.button
          .findByTitle('Recycle All Cluster Nodes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@recycleAllNodes');
    ui.toast.assertMessage('All cluster nodes queued for recycling');
  });

  /*
   * - Confirms UI flow when enabling and disabling node pool autoscaling using mocked API responses.
   * - Confirms that errors are shown when attempting to autoscale using invalid values.
   * - Confirms that UI updates to reflect node pool autoscale state.
   */
  it('can toggle autoscaling', () => {
    const autoscaleMin = 3;
    const autoscaleMax = 10;

    const minWarning =
      'Minimum must be between 1 and 99 nodes and cannot be greater than Maximum.';
    const maxWarning = 'Maximum must be between 1 and 100 nodes.';

    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
    });

    const mockNodePool = nodePoolFactory.build({
      count: 1,
      type: 'g6-standard-1',
      nodes: kubeLinodeFactory.buildList(1),
    });

    const mockNodePoolAutoscale = {
      ...mockNodePool,
      autoscaler: {
        enabled: true,
        min: autoscaleMin,
        max: autoscaleMax,
      },
    };

    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, [mockNodePool]).as('getNodePools');
    mockGetKubernetesVersions().as('getVersions');
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools', '@getVersions']);

    // Click "Autoscale Pool", enable autoscaling, and set min and max values.
    mockUpdateNodePool(mockCluster.id, mockNodePoolAutoscale).as(
      'toggleAutoscale'
    );
    mockGetClusterPools(mockCluster.id, [mockNodePoolAutoscale]).as(
      'getNodePools'
    );
    ui.button
      .findByTitle('Autoscale Pool')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle('Autoscale Pool')
      .should('be.visible')
      .within(() => {
        cy.findByText('Autoscaler').should('be.visible').click();

        cy.findByLabelText('Min')
          .should('be.visible')
          .click()
          .clear()
          .type(`${autoscaleMin}`);

        cy.findByText(minWarning).should('be.visible');

        cy.findByLabelText('Max')
          .should('be.visible')
          .click()
          .clear()
          .type('101');

        cy.findByText(minWarning).should('not.exist');
        cy.findByText(maxWarning).should('be.visible');

        cy.findByLabelText('Max')
          .should('be.visible')
          .click()
          .clear()
          .type(`${autoscaleMax}`);

        cy.findByText(minWarning).should('not.exist');
        cy.findByText(maxWarning).should('not.exist');

        ui.button.findByTitle('Save Changes').should('be.visible').click();
      });

    // Wait for API response and confirm that UI updates to reflect autoscale.
    cy.wait(['@toggleAutoscale', '@getNodePools']);
    ui.toast.assertMessage(
      `Autoscaling updated for Node Pool ${mockNodePool.id}.`
    );
    cy.findByText(`(Min ${autoscaleMin} / Max ${autoscaleMax})`).should(
      'be.visible'
    );

    // Click "Autoscale Pool" again and disable autoscaling.
    mockUpdateNodePool(mockCluster.id, mockNodePool).as('toggleAutoscale');
    mockGetClusterPools(mockCluster.id, [mockNodePool]).as('getNodePools');
    ui.button
      .findByTitle('Autoscale Pool')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle('Autoscale Pool')
      .should('be.visible')
      .within(() => {
        cy.findByText('Autoscaler').should('be.visible').click();

        ui.button
          .findByTitle('Save Changes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for API response and confirm that UI updates to reflect no autoscale.
    cy.wait(['@toggleAutoscale', '@getNodePools']);
    ui.toast.assertMessage(
      `Autoscaling updated for Node Pool ${mockNodePool.id}.`
    );
    cy.findByText(`(Min ${autoscaleMin} / Max ${autoscaleMax})`).should(
      'not.exist'
    );
  });

  /*
   * - Confirms node pool resize UI flow using mocked API responses.
   * - Confirms that pool size can be increased and decreased.
   * - Confirms that user is warned when decreasing node pool size.
   * - Confirms that UI updates to reflect new node pool size.
   */
  it('can resize pools', () => {
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
    });

    const mockNodePoolResized = nodePoolFactory.build({
      count: 3,
      type: 'g6-standard-1',
      nodes: kubeLinodeFactory.buildList(3),
    });

    const mockNodePoolInitial = {
      ...mockNodePoolResized,
      count: 1,
      nodes: [mockNodePoolResized.nodes[0]],
    };

    const mockLinodes: Linode[] = mockNodePoolResized.nodes.map(
      (node: PoolNodeResponse): Linode => {
        return linodeFactory.build({
          id: node.instance_id ?? undefined,
          ipv4: [randomIp()],
        });
      }
    );

    const mockNodePoolDrawerTitle = 'Resize Pool: Linode 2 GB Plan';

    const decreaseSizeWarning =
      'Resizing to fewer nodes will delete random nodes from the pool.';
    const nodeSizeRecommendation =
      'We recommend a minimum of 3 nodes in each Node Pool to avoid downtime during upgrades and maintenance.';

    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, [mockNodePoolInitial]).as(
      'getNodePools'
    );
    mockGetLinodes(mockLinodes).as('getLinodes');
    mockGetKubernetesVersions().as('getVersions');
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools', '@getLinodes', '@getVersions']);

    // Confirm that nodes are listed with correct details.
    mockNodePoolInitial.nodes.forEach((node: PoolNodeResponse) => {
      cy.get(`tr[data-qa-node-row="${node.id}"]`)
        .should('be.visible')
        .within(() => {
          const nodeLinode = mockLinodes.find(
            (linode: Linode) => linode.id === node.instance_id
          );
          if (nodeLinode) {
            cy.findByText(nodeLinode.label).should('be.visible');
            cy.findByText(nodeLinode.ipv4[0]).should('be.visible');
            ui.button
              .findByTitle('Recycle')
              .should('be.visible')
              .should('be.enabled');
          }
        });
    });

    // Click "Resize Pool" and increase size to 3 nodes.
    ui.button
      .findByTitle('Resize Pool')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockUpdateNodePool(mockCluster.id, mockNodePoolResized).as(
      'resizeNodePool'
    );
    mockGetClusterPools(mockCluster.id, [mockNodePoolResized]).as(
      'getNodePools'
    );
    ui.drawer
      .findByTitle(mockNodePoolDrawerTitle)
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Save Changes')
          .should('be.visible')
          .should('be.disabled');

        cy.findByText('Resized pool: $12/month (1 node at $12/month)').should(
          'be.visible'
        );

        cy.findByLabelText('Add 1')
          .should('be.visible')
          .should('be.enabled')
          .click()
          .click();

        cy.findByLabelText('Edit Quantity').should('have.value', '3');
        cy.findByText('Resized pool: $36/month (3 nodes at $12/month)').should(
          'be.visible'
        );

        ui.button
          .findByTitle('Save Changes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@resizeNodePool', '@getNodePools']);

    // Confirm that new nodes are listed with correct info.
    mockLinodes.forEach((mockLinode: Linode) => {
      cy.findByText(mockLinode.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText(mockLinode.ipv4[0]).should('be.visible');
        });
    });

    // Click "Resize Pool" and decrease size back to 1 node.
    ui.button
      .findByTitle('Resize Pool')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockUpdateNodePool(mockCluster.id, mockNodePoolInitial).as(
      'resizeNodePool'
    );
    mockGetClusterPools(mockCluster.id, [mockNodePoolInitial]).as(
      'getNodePools'
    );
    ui.drawer
      .findByTitle(mockNodePoolDrawerTitle)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Subtract 1')
          .should('be.visible')
          .should('be.enabled')
          .click()
          .click();

        cy.findByText(decreaseSizeWarning).should('be.visible');
        cy.findByText(nodeSizeRecommendation).should('be.visible');

        ui.button
          .findByTitle('Save Changes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@resizeNodePool', '@getNodePools']);
    cy.get('[data-qa-node-row]').should('have.length', 1);
  });

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
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

    const resetWarnings = [
      'This will delete and regenerate the cluster’s Kubeconfig file',
      'You will no longer be able to access this cluster via your previous Kubeconfig file',
      'This action cannot be undone',
    ];

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
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

  /*
   * - Confirms UI flow when adding and deleting node pools.
   * - Confirms that user cannot delete a node pool when there is only 1 pool.
   * - Confirms that details page updates to reflect change when pools are added or deleted.
   */
  it('can add and delete node pools', () => {
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
    });

    const mockNodePool = nodePoolFactory.build({
      type: 'g6-dedicated-4',
    });

    const mockNewNodePool = nodePoolFactory.build({
      type: 'g6-dedicated-2',
    });

    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, [mockNodePool]).as('getNodePools');
    mockGetKubernetesVersions().as('getVersions');
    mockAddNodePool(mockCluster.id, mockNewNodePool).as('addNodePool');
    mockDeleteNodePool(mockCluster.id, mockNewNodePool.id).as('deleteNodePool');
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools', '@getVersions']);

    // Assert that initial node pool is shown on the page.
    cy.findByText('Dedicated 8 GB', { selector: 'h2' }).should('be.visible');

    // "Delete Pool" button should be disabled when only 1 node pool exists.
    ui.button
      .findByTitle('Delete Pool')
      .should('be.visible')
      .should('be.disabled');

    // Add a new node pool, select plan, submit form in drawer.
    ui.button
      .findByTitle('Add a Node Pool')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockGetClusterPools(mockCluster.id, [mockNodePool, mockNewNodePool]).as(
      'getNodePools'
    );
    ui.drawer
      .findByTitle(`Add a Node Pool: ${mockCluster.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByText('Dedicated 4 GB')
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByLabelText('Add 1').should('be.visible').click();
          });

        ui.button
          .findByTitle('Add pool')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for API responses and confirm that both node pools are shown.
    cy.wait(['@addNodePool', '@getNodePools']);
    cy.findByText('Dedicated 8 GB', { selector: 'h2' }).should('be.visible');
    cy.findByText('Dedicated 4 GB', { selector: 'h2' }).should('be.visible');

    // Delete the newly added node pool.
    cy.get(`[data-qa-node-pool-id="${mockNewNodePool.id}"]`)
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Delete Pool')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    mockGetClusterPools(mockCluster.id, [mockNodePool]).as('getNodePools');
    ui.dialog
      .findByTitle('Delete Node Pool?')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm node pool is deleted, original node pool still exists, and
    // delete pool button is once again disabled.
    cy.wait(['@deleteNodePool', '@getNodePools']);
    cy.findByText('Dedicated 8 GB', { selector: 'h2' }).should('be.visible');
    cy.findByText('Dedicated 4 GB', { selector: 'h2' }).should('not.exist');

    ui.button
      .findByTitle('Delete Pool')
      .should('be.visible')
      .should('be.disabled');
  });
});

describe('LKE cluster updates for DC-specific prices', () => {
  /*
   * - Confirms node pool resize UI flow using mocked API responses.
   * - Confirms that pool size can be increased and decreased.
   * - Confirms that drawer reflects prices in regions with DC-specific pricing.
   * - Confirms that details page updates total cluster price with DC-specific pricing.
   */
  it('can resize pools with DC-specific prices', () => {
    const dcSpecificPricingRegion = getRegionById('us-east');

    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
      region: dcSpecificPricingRegion.id,
      control_plane: {
        high_availability: false,
      },
    });

    const mockNodePoolResized = nodePoolFactory.build({
      count: 3,
      type: dcPricingMockLinodeTypes[0].id,
      nodes: kubeLinodeFactory.buildList(3),
    });

    const mockNodePoolInitial = {
      ...mockNodePoolResized,
      count: 1,
      nodes: [mockNodePoolResized.nodes[0]],
    };

    const mockLinodes: Linode[] = mockNodePoolResized.nodes.map(
      (node: PoolNodeResponse): Linode => {
        return linodeFactory.build({
          id: node.instance_id ?? undefined,
          ipv4: [randomIp()],
          region: dcSpecificPricingRegion.id,
          type: dcPricingMockLinodeTypes[0].id,
        });
      }
    );

    const mockNodePoolDrawerTitle = 'Resize Pool: Linode 0 GB Plan';

    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, [mockNodePoolInitial]).as(
      'getNodePools'
    );
    mockGetLinodes(mockLinodes).as('getLinodes');
    mockGetLinodeType(dcPricingMockLinodeTypes[0]).as('getLinodeType');
    mockGetKubernetesVersions().as('getVersions');
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait([
      '@getCluster',
      '@getNodePools',
      '@getLinodes',
      '@getVersions',
      '@getLinodeType',
    ]);

    // Confirm that nodes are visible.
    mockNodePoolInitial.nodes.forEach((node: PoolNodeResponse) => {
      cy.get(`tr[data-qa-node-row="${node.id}"]`)
        .should('be.visible')
        .within(() => {
          const nodeLinode = mockLinodes.find(
            (linode: Linode) => linode.id === node.instance_id
          );
          if (nodeLinode) {
            cy.findByText(nodeLinode.label).should('be.visible');
          }
        });
    });

    // Confirm total price is listed in Kube Specs.
    cy.findByText('$14.40/month').should('be.visible');

    // Click "Resize Pool" and increase size to 3 nodes.
    ui.button
      .findByTitle('Resize Pool')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockUpdateNodePool(mockCluster.id, mockNodePoolResized).as(
      'resizeNodePool'
    );
    mockGetClusterPools(mockCluster.id, [mockNodePoolResized]).as(
      'getNodePools'
    );
    ui.drawer
      .findByTitle(mockNodePoolDrawerTitle)
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Save Changes')
          .should('be.visible')
          .should('be.disabled');

        cy.findByText(
          'Current pool: $14.40/month (1 node at $14.40/month)'
        ).should('be.visible');
        cy.findByText(
          'Resized pool: $14.40/month (1 node at $14.40/month)'
        ).should('be.visible');

        cy.findByLabelText('Add 1')
          .should('be.visible')
          .should('be.enabled')
          .click()
          .click()
          .click();

        cy.findByLabelText('Edit Quantity').should('have.value', '4');
        cy.findByText(
          'Current pool: $14.40/month (1 node at $14.40/month)'
        ).should('be.visible');
        cy.findByText(
          'Resized pool: $57.60/month (4 nodes at $14.40/month)'
        ).should('be.visible');

        cy.findByLabelText('Subtract 1')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.findByLabelText('Edit Quantity').should('have.value', '3');
        cy.findByText(
          'Resized pool: $43.20/month (3 nodes at $14.40/month)'
        ).should('be.visible');

        ui.button
          .findByTitle('Save Changes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@resizeNodePool', '@getNodePools']);

    // Confirm total price updates in Kube Specs.
    cy.findByText('$43.20/month').should('be.visible');
  });

  /*
   * - Confirms UI flow when adding node pools using mocked API responses.
   * - Confirms that drawer reflects prices in regions with DC-specific pricing.
   * - Confirms that details page updates total cluster price with DC-specific pricing.
   */
  it('can add node pools with DC-specific prices', () => {
    const dcSpecificPricingRegion = getRegionById('us-east');

    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
      region: dcSpecificPricingRegion.id,
      control_plane: {
        high_availability: false,
      },
    });

    const mockNewNodePool = nodePoolFactory.build({
      count: 2,
      type: dcPricingMockLinodeTypes[0].id,
      nodes: kubeLinodeFactory.buildList(2),
    });

    const mockNodePool = nodePoolFactory.build({
      count: 1,
      type: dcPricingMockLinodeTypes[0].id,
      nodes: kubeLinodeFactory.buildList(1),
    });

    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, [mockNodePool]).as('getNodePools');
    mockGetKubernetesVersions().as('getVersions');
    mockAddNodePool(mockCluster.id, mockNewNodePool).as('addNodePool');
    mockGetLinodeType(dcPricingMockLinodeTypes[0]).as('getLinodeType');
    mockGetLinodeTypes(dcPricingMockLinodeTypes);
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools', '@getVersions', '@getLinodeType']);

    // Assert that initial node pool is shown on the page.
    cy.findByText('Linode 0 GB', { selector: 'h2' }).should('be.visible');

    // Confirm total price is listed in Kube Specs.
    cy.findByText('$14.40/month').should('be.visible');

    // Add a new node pool, select plan, submit form in drawer.
    ui.button
      .findByTitle('Add a Node Pool')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockGetClusterPools(mockCluster.id, [mockNodePool, mockNewNodePool]).as(
      'getNodePools'
    );

    ui.drawer
      .findByTitle(`Add a Node Pool: ${mockCluster.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByText('Linode 0 GB')
          .should('be.visible')
          .closest('tr')
          .within(() => {
            // Assert that DC-specific prices are displayed the plan table, then add a node pool with 2 linodes.
            cy.findByText('$14.40').should('be.visible');
            cy.findByText('$0.021').should('be.visible');
            cy.findByLabelText('Add 1').should('be.visible').click().click();
          });

        // Assert that DC-specific prices are displayed as helper text.
        cy.contains(
          'This pool will add $28.80/month (2 nodes at $14.40/month) to this cluster.'
        ).should('be.visible');

        ui.button
          .findByTitle('Add pool')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for API responses.
    cy.wait(['@addNodePool', '@getNodePools']);

    // Confirm total price updates in Kube Specs: $14.40/mo existing pool + $28.80/mo new pool.
    cy.findByText('$43.20/month').should('be.visible');
  });
});
