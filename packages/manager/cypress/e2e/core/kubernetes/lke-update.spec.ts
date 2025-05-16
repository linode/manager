import {
  linodeFactory,
  linodeTypeFactory,
  regionFactory,
} from '@linode/utilities';
import { DateTime } from 'luxon';
import { dcPricingMockLinodeTypes } from 'support/constants/dc-specific-pricing';
import { latestKubernetesVersion } from 'support/constants/lke';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodes,
  mockGetLinodeType,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';
import {
  mockAddNodePool,
  mockDeleteNodePool,
  mockGetApiEndpoints,
  mockGetCluster,
  mockGetClusterPools,
  mockGetControlPlaneACL,
  mockGetControlPlaneACLError,
  mockGetDashboardUrl,
  mockGetKubernetesVersions,
  mockGetTieredKubernetesVersions,
  mockRecycleAllNodes,
  mockRecycleNode,
  mockRecycleNodePool,
  mockResetKubeconfig,
  mockUpdateCluster,
  mockUpdateClusterError,
  mockUpdateControlPlaneACL,
  mockUpdateControlPlaneACLError,
  mockUpdateNodePool,
  mockUpdateNodePoolError,
} from 'support/intercepts/lke';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { buildArray } from 'support/util/arrays';
import { randomIp, randomLabel, randomString } from 'support/util/random';
import { extendRegion } from 'support/util/regions';

import {
  accountFactory,
  kubeLinodeFactory,
  kubernetesClusterFactory,
  kubernetesControlPlaneACLFactory,
  kubernetesControlPlaneACLOptionsFactory,
  nodePoolFactory,
} from 'src/factories';
import { extendType } from 'src/utilities/extendType';

import type { Label, Linode, PoolNodeResponse, Taint } from '@linode/api-v4';

const mockNodePools = nodePoolFactory.buildList(2);

describe('LKE cluster updates', () => {
  // TODO Add LKE update tests to cover flows when APL is enabled.
  describe('APL disabled', () => {
    /*
     * - Confirms UI flow of upgrading a cluster to high availability control plane using mocked data.
     * - Confirms that user is shown a warning and agrees to billing changes before upgrading.
     * - Confirms that details page updates accordingly after upgrading to high availability.
     */
    it('can upgrade to high availability', () => {
      const mockCluster = kubernetesClusterFactory.build({
        control_plane: {
          high_availability: false,
        },
        k8s_version: latestKubernetesVersion,
      });

      const mockClusterWithHA = {
        ...mockCluster,
        control_plane: {
          high_availability: true,
        },
      };

      const haUpgradeWarnings = [
        'All nodes will be deleted and new nodes will be created to replace them.',
        'Any data stored within local storage of your node(s) (such as ’hostPath’ volumes) is deleted.',
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
    it('can upgrade standard kubernetes version from the details page', () => {
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
        'This upgrades the control plane on your cluster and ensures that any new worker nodes are created using the newer Kubernetes version.',
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
          `Upgrade Kubernetes version to ${newVersion} on ${mockCluster.label}?`
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

      const stepTwoDialogTitle = 'Upgrade complete';

      ui.dialog
        .findByTitle(stepTwoDialogTitle)
        .should('be.visible')
        .within(() => {
          cy.findByText(
            'The cluster’s Kubernetes version has been updated successfully',
            {
              exact: false,
            }
          ).should('be.visible');

          cy.findByText(
            'To upgrade your existing worker nodes, you can recycle all nodes (which may have a performance impact) or perform other upgrade methods.',
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
     * - Confirms UI flow of upgrading Kubernetes enterprise version using mocked API requests.
     * - Confirms that Kubernetes upgrade prompt is shown when not up-to-date.
     * - Confirms that Kubernetes upgrade prompt is hidden when up-to-date.
     */
    it('can upgrade enterprise kubernetes version from the details page', () => {
      const oldVersion = '1.31.1+lke1';
      const newVersion = '1.31.1+lke2';
      const clusterRegion = extendRegion(
        regionFactory.build({
          capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
          id: 'us-central',
        })
      );
      mockGetRegions([clusterRegion]).as('getRegions');
      mockGetAccount(
        accountFactory.build({
          capabilities: ['Kubernetes Enterprise'],
        })
      ).as('getAccount');

      // TODO LKE-E: Remove once feature is in GA
      mockAppendFeatureFlags({
        lkeEnterprise: { enabled: true, la: true },
      });

      const mockCluster = kubernetesClusterFactory.build({
        k8s_version: oldVersion,
        region: clusterRegion.id,
        tier: 'enterprise',
      });

      const mockClusterUpdated = {
        ...mockCluster,
        k8s_version: newVersion,
      };

      const upgradePrompt =
        'A new version of Kubernetes is available (1.31.1+lke2).';

      const upgradeNotes = [
        'This upgrades the control plane on your cluster and ensures that any new worker nodes are created using the newer Kubernetes version.',
        // Confirm that the old version and new version are both shown.
        oldVersion,
        newVersion,
      ];

      mockGetCluster(mockCluster).as('getCluster');
      mockGetTieredKubernetesVersions('enterprise', [
        { id: newVersion, tier: 'enterprise' },
        { id: oldVersion, tier: 'enterprise' },
      ]).as('getTieredVersions');
      mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
      mockUpdateCluster(mockCluster.id, mockClusterUpdated).as('updateCluster');
      mockGetDashboardUrl(mockCluster.id);
      mockGetApiEndpoints(mockCluster.id);

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait([
        '@getRegions',
        '@getAccount',
        '@getCluster',
        '@getNodePools',
        '@getTieredVersions',
      ]);

      // Confirm that upgrade prompt is shown.
      cy.findByText(upgradePrompt).should('be.visible');
      ui.button
        .findByTitle('Upgrade Version')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.dialog
        .findByTitle(
          `Upgrade Kubernetes version to ${newVersion} on ${mockCluster.label}?`
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

      const stepTwoDialogTitle = 'Upgrade complete';

      ui.dialog
        .findByTitle(stepTwoDialogTitle)
        .should('be.visible')
        .within(() => {
          cy.findByText(
            'The cluster’s Kubernetes version has been updated successfully',
            {
              exact: false,
            }
          ).should('be.visible');

          cy.findByText(
            'To upgrade your existing worker nodes, you can recycle all nodes (which may have a performance impact) or perform other upgrade methods.',
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
        nodes: [mockKubeLinode],
        type: 'g6-standard-1',
      });

      const mockLinode = linodeFactory.build({
        id: mockKubeLinode.instance_id ?? undefined,
        label: randomLabel(),
      });

      const recycleWarningSubstrings = [
        'Any data stored within local storage of your node(s) (such as ’hostPath’ volumes) is deleted',
        'using local storage for important data is not common or recommended',
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
          cy.findByText('Delete and recreate this node.', {
            exact: false,
          }).should('be.visible');
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

      mockRecycleNodePool(mockCluster.id, mockNodePool.id).as(
        'recycleNodePool'
      );
      ui.dialog
        .findByTitle('Recycle node pool?')
        .should('be.visible')
        .within(() => {
          cy.findByText('Delete and recreate all nodes in this node pool.', {
            exact: false,
          }).should('be.visible');
          recycleWarningSubstrings.forEach((warning: string) => {
            cy.findByText(warning, { exact: false }).should('be.visible');
          });

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
          cy.findByText('Delete and recreate all nodes in this cluster.', {
            exact: false,
          }).should('be.visible');
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
     * - Confirms that errors are shown when attempting to autoscale using invalid values based on the cluster tier.
     * - Confirms that UI updates to reflect node pool autoscale state.
     */
    it('can toggle autoscaling on a standard tier cluster', () => {
      const autoscaleMin = 3;
      const autoscaleMax = 10;
      const minWarning =
        'Minimum must be between 1 and 99 nodes and cannot be greater than Maximum.';
      const maxWarning = 'Maximum must be between 1 and 100 nodes.';

      const mockCluster = kubernetesClusterFactory.build({
        k8s_version: latestKubernetesVersion,
        tier: 'standard',
      });

      const mockNodePool = nodePoolFactory.build({
        count: 1,
        nodes: kubeLinodeFactory.buildList(1),
        type: 'g6-standard-1',
      });

      const mockNodePoolAutoscale = {
        ...mockNodePool,
        autoscaler: {
          enabled: true,
          max: autoscaleMax,
          min: autoscaleMin,
        },
      };

      mockGetCluster(mockCluster).as('getCluster');
      mockGetClusterPools(mockCluster.id, [mockNodePool]).as('getNodePools');
      mockGetKubernetesVersions().as('getVersions');
      mockGetDashboardUrl(mockCluster.id);
      mockGetApiEndpoints(mockCluster.id);
      mockGetAccount(
        accountFactory.build({
          capabilities: ['Kubernetes Enterprise'],
        })
      ).as('getAccount');
      // TODO LKE-E: Remove once feature is in GA
      mockAppendFeatureFlags({
        lkeEnterprise: { enabled: true, la: true },
      });

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait(['@getAccount', '@getCluster', '@getNodePools', '@getVersions']);

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
          cy.findByText('Autoscale').should('be.visible').click();

          cy.findByLabelText('Min').should('be.visible').click();
          cy.focused().clear();
          cy.focused().type(`${autoscaleMin}`);

          cy.findByText(minWarning).should('be.visible');

          cy.findByLabelText('Max').should('be.visible').click();
          cy.focused().clear();
          cy.focused().type('101');

          cy.findByText(minWarning).should('not.exist');
          cy.findByText(maxWarning).should('be.visible');

          cy.findByLabelText('Max').should('be.visible').click();
          cy.focused().clear();
          cy.focused().type(`${autoscaleMax}`);

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
          cy.findByText('Autoscale').should('be.visible').click();

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
     * - Confirms UI flow when enabling and disabling node pool autoscaling using mocked API responses.
     * - Confirms that errors are shown when attempting to autoscale using invalid values based on the cluster tier.
     * - Confirms that UI updates to reflect node pool autoscale state.
     */
    it('can toggle autoscaling on an enterprise tier cluster', () => {
      const autoscaleMin = 1;
      const autoscaleMax = 500;

      const minWarning =
        'Minimum must be between 1 and 499 nodes and cannot be greater than Maximum.';
      const maxWarning = 'Maximum must be between 1 and 500 nodes.';

      const mockCluster = kubernetesClusterFactory.build({
        k8s_version: latestKubernetesVersion,
        tier: 'enterprise',
      });

      const mockNodePool = nodePoolFactory.build({
        count: 1,
        nodes: kubeLinodeFactory.buildList(1),
        type: 'g6-dedicated-4',
      });

      const mockNodePoolAutoscale = {
        ...mockNodePool,
        autoscaler: {
          enabled: true,
          max: autoscaleMax,
          min: autoscaleMin,
        },
      };

      mockGetCluster(mockCluster).as('getCluster');
      mockGetClusterPools(mockCluster.id, [mockNodePool]).as('getNodePools');
      mockGetKubernetesVersions().as('getVersions');
      mockGetDashboardUrl(mockCluster.id);
      mockGetApiEndpoints(mockCluster.id);
      mockGetAccount(
        accountFactory.build({
          capabilities: ['Kubernetes Enterprise'],
        })
      ).as('getAccount');
      // TODO LKE-E: Remove once feature is in GA
      mockAppendFeatureFlags({
        lkeEnterprise: { enabled: true, la: true },
      });

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait(['@getAccount', '@getCluster', '@getNodePools', '@getVersions']);

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
          cy.findByText('Autoscale').should('be.visible').click();

          cy.findByLabelText('Min').should('be.visible').click();
          cy.focused().clear();
          cy.focused().type(`${autoscaleMin - 1}`);

          cy.findByText(minWarning).should('be.visible');

          cy.findByLabelText('Max').should('be.visible').click();
          cy.focused().clear();
          cy.focused().type('501');

          cy.findByText(maxWarning).should('be.visible');
          cy.findByText(minWarning).should('not.exist');

          cy.findByLabelText('Max').should('be.visible').click();
          cy.focused().clear();
          cy.focused().type(`${autoscaleMax}`);

          cy.findByText(minWarning).should('not.exist');
          cy.findByText(maxWarning).should('not.exist');

          ui.button.findByTitle('Save Changes').should('be.disabled');

          cy.findByLabelText('Min').should('be.visible').click();
          cy.focused().clear();
          cy.focused().type(`${autoscaleMin + 1}`);

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
        nodes: kubeLinodeFactory.buildList(3),
        type: 'g6-standard-1',
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

          cy.findByText(
            'Current price: $12/month (1 node at $12/month each)'
          ).should('be.visible');
          cy.findByText(
            'Resized price: $12/month (1 node at $12/month each)'
          ).should('be.visible');

          cy.findByLabelText('Add 1')
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.focused().click();

          cy.findByLabelText('Edit Quantity').should('have.value', '3');
          cy.findByText(
            'Resized price: $36/month (3 nodes at $12/month each)'
          ).should('be.visible');

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
            .click();
          cy.focused().click();

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
      cy.findByText('Reset').should('be.visible').click({ force: true });
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
      const clusterRegion = extendRegion(
        regionFactory.build({
          capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
          id: 'us-east',
        })
      );
      mockGetRegions([clusterRegion]).as('getRegions');
      const mockCluster = kubernetesClusterFactory.build({
        k8s_version: latestKubernetesVersion,
        region: clusterRegion.id,
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
      mockDeleteNodePool(mockCluster.id, mockNewNodePool.id).as(
        'deleteNodePool'
      );
      mockGetDashboardUrl(mockCluster.id);
      mockGetApiEndpoints(mockCluster.id);

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait(['@getRegions', '@getCluster', '@getNodePools', '@getVersions']);

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

    /*
     * - Confirms LKE summary page updates to reflect new cluster name.
     */
    it('can rename cluster', () => {
      const mockCluster = kubernetesClusterFactory.build({
        k8s_version: latestKubernetesVersion,
      });
      const mockNewCluster = kubernetesClusterFactory.build({
        label: 'newClusterName',
      });

      mockGetCluster(mockCluster).as('getCluster');
      mockGetKubernetesVersions().as('getVersions');
      mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
      mockUpdateCluster(mockCluster.id, mockNewCluster).as('updateCluster');

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
      cy.wait(['@getCluster', '@getNodePools', '@getVersions']);

      // LKE clusters can be renamed by clicking on the cluster's name in the breadcrumbs towards the top of the page.
      cy.get('[data-testid="editable-text"] > [data-testid="button"]').click();
      cy.get('[data-qa-edit-field]').within(() => {
        cy.findByTestId('textfield-input')
          .should('be.visible')
          .should('have.value', mockCluster.label)
          .clear();
        cy.focused().type(`${mockNewCluster.label}{enter}`);
      });

      cy.wait('@updateCluster');

      cy.findAllByText(mockNewCluster.label).should('be.visible');
      cy.findAllByText(mockCluster.label).should('not.exist');
    });

    /*
     * - Confirms error message shows when the API request fails.
     */
    it('can handle API errors when renaming cluster', () => {
      const mockCluster = kubernetesClusterFactory.build({
        k8s_version: latestKubernetesVersion,
      });
      const mockErrorCluster = kubernetesClusterFactory.build({
        label: 'errorClusterName',
      });
      const mockErrorMessage = 'API request fails';

      mockGetCluster(mockCluster).as('getCluster');
      mockGetKubernetesVersions().as('getVersions');
      mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
      mockUpdateClusterError(mockCluster.id, mockErrorMessage).as(
        'updateClusterError'
      );

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
      cy.wait(['@getCluster', '@getNodePools', '@getVersions']);

      // LKE cluster can be renamed by clicking on the cluster's name in the breadcrumbs towards the top of the page.
      cy.get('[data-testid="editable-text"] > [data-testid="button"]').click();
      cy.get('[data-qa-edit-field]').within(() => {
        cy.findByTestId('textfield-input')
          .should('be.visible')
          .should('have.value', mockCluster.label)
          .clear();
        cy.focused().type(`${mockErrorCluster.label}{enter}`);
      });

      // Error message shows when API request fails.
      cy.wait('@updateClusterError');
      cy.findAllByText(mockErrorMessage).should('be.visible');
    });
  });

  it('can add and delete node pool tags', () => {
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
    });

    const mockType = linodeTypeFactory.build();

    const mockNodePoolInstances = buildArray(3, () =>
      linodeFactory.build({ label: randomLabel() })
    );

    const mockNodes = mockNodePoolInstances.map((linode, i) =>
      kubeLinodeFactory.build({
        instance_id: linode.id,
        status: 'ready',
      })
    );

    const mockNodePoolNoTags = nodePoolFactory.build({
      id: 1,
      nodes: mockNodes,
      type: mockType.id,
    });

    const mockNodePoolWithTags = {
      ...mockNodePoolNoTags,
      tags: ['test-tag'],
    };

    mockGetLinodes(mockNodePoolInstances);
    mockGetLinodeType(linodeTypeFactory.build({ id: mockType.id })).as(
      'getType'
    );
    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, [mockNodePoolNoTags]).as(
      'getNodePoolsNoTags'
    );
    mockGetKubernetesVersions().as('getVersions');
    mockGetControlPlaneACL(mockCluster.id, { acl: { enabled: false } }).as(
      'getControlPlaneAcl'
    );
    mockUpdateNodePool(mockCluster.id, mockNodePoolWithTags).as('addTag');
    mockGetDashboardUrl(mockCluster.id);
    mockGetApiEndpoints(mockCluster.id);

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait([
      '@getCluster',
      '@getNodePoolsNoTags',
      '@getVersions',
      '@getType',
      '@getControlPlaneAcl',
    ]);

    // Confirm that Linode instance info has finished loading before attempting
    // to interact with the tag button.
    mockNodePoolInstances.forEach((linode) => {
      cy.findByText(linode.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText('Running').should('be.visible');
        });
    });

    cy.get(`[data-qa-node-pool-id="${mockNodePoolNoTags.id}"]`).within(() => {
      ui.button.findByTitle('Add a tag').should('be.visible').click();

      cy.findByLabelText('Create or Select a Tag')
        .should('be.visible')
        .type(`${mockNodePoolWithTags.tags[0]}`);

      ui.autocompletePopper
        .findByTitle(`Create "${mockNodePoolWithTags.tags[0]}"`)
        .scrollIntoView()
        .should('be.visible')
        .click();
    });

    mockGetClusterPools(mockCluster.id, [mockNodePoolWithTags]).as(
      'getNodePoolsWithTags'
    );

    cy.wait(['@addTag', '@getNodePoolsWithTags']);

    mockUpdateNodePool(mockCluster.id, mockNodePoolNoTags).as('deleteTag');
    mockGetClusterPools(mockCluster.id, [mockNodePoolNoTags]).as(
      'getNodePoolsNoTags'
    );

    // Delete the newly added node pool tag.
    cy.get(`[data-qa-tag="${mockNodePoolWithTags.tags[0]}"]`)
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-delete-tag="true"]').should('be.visible').click();
      });

    cy.wait(['@deleteTag', '@getNodePoolsNoTags']);

    cy.get(`[data-qa-tag="${mockNodePoolWithTags.tags[0]}"]`).should(
      'not.exist'
    );
  });

  /*
   * - Confirms Labels and Taints button exists for a node pool.
   * - Confirms Labels and Taints drawer displays the expected Labels and Taints.
   * - Confirms Labels and Taints can be deleted from a node pool.
   * - Confirms that Labels and Taints can be added to a node pool.
   * - Confirms validation and errors are handled gracefully.
   */
  describe('confirms labels and taints functionality for a node pool', () => {
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
    });

    const mockType = linodeTypeFactory.build({ label: 'Linode 2 GB' });

    const mockNodePoolInstances = buildArray(1, () =>
      linodeFactory.build({ label: randomLabel() })
    );

    const mockNodes = mockNodePoolInstances.map((linode, i) =>
      kubeLinodeFactory.build({
        instance_id: linode.id,
        status: 'ready',
      })
    );

    const mockNodePoolInitial = nodePoolFactory.build({
      id: 1,
      labels: {
        ['example.com/my-app']: 'teams',
      },
      nodes: mockNodes,
      taints: [
        {
          effect: 'NoSchedule',
          key: 'example.com/my-app',
          value: 'teamA',
        },
      ],
      type: mockType.id,
    });

    const mockDrawerTitle = 'Labels and Taints: Linode 2 GB Plan';

    beforeEach(() => {
      mockGetLinodes(mockNodePoolInstances);
      mockGetLinodeType(mockType).as('getType');
      mockGetCluster(mockCluster).as('getCluster');
      mockGetClusterPools(mockCluster.id, [mockNodePoolInitial]).as(
        'getNodePools'
      );
      mockGetKubernetesVersions().as('getVersions');
      mockGetControlPlaneACL(mockCluster.id, { acl: { enabled: false } }).as(
        'getControlPlaneAcl'
      );
      mockGetDashboardUrl(mockCluster.id);
      mockGetApiEndpoints(mockCluster.id);
    });

    it('can delete labels and taints', () => {
      const mockNodePoolUpdated = nodePoolFactory.build({
        id: 1,
        labels: {},
        nodes: mockNodes,
        taints: [],
        type: mockType.id,
      });

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait([
        '@getCluster',
        '@getNodePools',
        '@getVersions',
        '@getType',
        '@getControlPlaneAcl',
      ]);

      mockUpdateNodePool(mockCluster.id, mockNodePoolUpdated).as(
        'updateNodePool'
      );
      mockGetClusterPools(mockCluster.id, [mockNodePoolUpdated]).as(
        'getNodePoolsUpdated'
      );

      // Click "Labels and Taints" button and confirm drawer contents.
      ui.button
        .findByTitle('Labels and Taints')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(mockDrawerTitle)
        .should('be.visible')
        .within(() => {
          // Confirm drawer opens with the correct CTAs.
          ui.button
            .findByTitle('Save Changes')
            .should('be.visible')
            .should('be.disabled');

          ui.button
            .findByTitle('Cancel')
            .should('be.visible')
            .should('be.enabled');

          // Confirm that the Labels table exists and is populated with the correct details.
          Object.entries(mockNodePoolInitial.labels).forEach(([key, value]) => {
            cy.get(`tr[data-qa-label-row="${key}"]`)
              .should('be.visible')
              .within(() => {
                cy.findByText(`${key}: ${value}`).should('be.visible');

                // Confirm delete button exists, then click it.
                ui.button
                  .findByAttribute('aria-label', `Remove ${key}: ${value}`)
                  .should('be.visible')
                  .should('be.enabled')
                  .click();

                // Confirm the label is no longer visible.
                cy.findByText(`${key}: ${value}`).should('not.exist');
              });
          });

          // Confirm that the Taints table exists and is populated with the correct details.
          mockNodePoolInitial.taints.forEach((taint: Taint) => {
            cy.get(`tr[data-qa-taint-row="${taint.key}"]`)
              .should('be.visible')
              .within(() => {
                cy.findByText(`${taint.key}: ${taint.value}`).should(
                  'be.visible'
                );
                cy.findByText(taint.effect).should('be.visible');

                // Confirm delete button exists, then click it.
                ui.button
                  .findByAttribute(
                    'aria-label',
                    `Remove ${taint.key}: ${taint.value}`
                  )
                  .should('be.visible')
                  .should('be.enabled')
                  .click();

                // Confirm the taint is no longer visible.
                cy.findByText(`${taint.key}: ${taint.value}`).should(
                  'not.exist'
                );
              });
          });

          // Confirm empty state text displays for both empty tables.
          cy.findByText('No labels').should('be.visible');
          cy.findByText('No taints').should('be.visible');

          // Confirm form can be submitted.
          ui.button
            .findByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm request has the correct data.
      cy.wait('@updateNodePool').then((xhr) => {
        const data = xhr.response?.body;
        if (data) {
          const actualLabels: Label = data.labels;
          const actualTaints: Taint[] = data.taints;

          expect(actualLabels).to.deep.equal(mockNodePoolUpdated.labels);
          expect(actualTaints).to.deep.equal(mockNodePoolUpdated.taints);
        }
      });

      cy.wait('@getNodePoolsUpdated');

      // Confirm drawer closes.
      cy.findByText(mockDrawerTitle).should('not.exist');
    });

    it('can add labels and taints', () => {
      const mockNewSimpleLabel = 'my_label.-key: my_label.-value';
      const mockNewDNSLabel = 'my_label-key.io/app: my_label.-value';
      const mockNewTaint: Taint = {
        effect: 'NoSchedule',
        key: 'my_taint.-key',
        value: 'my_taint.-value',
      };
      const mockNewDNSTaint: Taint = {
        effect: 'NoSchedule',
        key: 'my_taint-key.io/app',
        value: 'my_taint.-value',
      };
      const mockNodePoolUpdated = nodePoolFactory.build({
        id: 1,
        labels: {
          'my_label-key': 'my_label.-value',
          'my_label-key.io/app': 'my_label.-value',
        },
        nodes: mockNodes,
        taints: [mockNewTaint, mockNewDNSTaint],
        type: mockType.id,
      });

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait([
        '@getCluster',
        '@getNodePools',
        '@getVersions',
        '@getType',
        '@getControlPlaneAcl',
      ]);

      mockUpdateNodePool(mockCluster.id, mockNodePoolUpdated).as(
        'updateNodePool'
      );
      mockGetClusterPools(mockCluster.id, [mockNodePoolUpdated]).as(
        'getNodePoolsUpdated'
      );

      // Click "Labels and Taints" button and confirm drawer contents.
      ui.button
        .findByTitle('Labels and Taints')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(mockDrawerTitle)
        .should('be.visible')
        .within(() => {
          // Confirm drawer opens with the correct CTAs.
          ui.button
            .findByTitle('Save Changes')
            .should('be.visible')
            .should('be.disabled');

          ui.button
            .findByTitle('Cancel')
            .should('be.visible')
            .should('be.enabled');

          // Add a label:

          ui.button
            .findByTitle('Add Label')
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Confirm form button is disabled and label form displays with the correct CTAs.
          ui.button
            .findByTitle('Add Label')
            .should('be.visible')
            .should('be.disabled');

          // Confirm labels with simple keys and DNS subdomain keys can be added.
          [mockNewSimpleLabel, mockNewDNSLabel].forEach((newLabel, index) => {
            // Confirm form adds a valid new label.
            cy.findByLabelText('Label').click();
            cy.focused().type(newLabel);

            ui.button.findByTitle('Add').click();

            // Confirm add form closes and Add Label button is re-enabled.
            cy.findByLabelText('Label').should('not.exist');
            cy.findByLabelText('Add').should('not.exist');
            ui.button.findByTitle('Add Label').should('be.enabled');

            // Confirm new label is visible in table.
            cy.get(`tr[data-qa-label-row="${newLabel.split(':')[0]}"]`)
              .should('be.visible')
              .within(() => {
                cy.findByText(newLabel).should('be.visible');
              });

            if (index === 0) {
              ui.button.findByTitle('Add Label').click();
            }
          });

          // Add a taint:

          ui.button
            .findByTitle('Add Taint')
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Confirm form button is disabled and label form displays with the correct CTAs.
          ui.button.findByTitle('Add Taint').should('be.disabled');

          // Confirm taints with simple keys and DNS subdomain keys can be added.
          [mockNewTaint, mockNewDNSTaint].forEach((newTaint, index) => {
            // Confirm form adds a valid new taint.
            cy.findByLabelText('Taint').click();
            cy.focused().type(`${newTaint.key}: ${newTaint.value}`);

            ui.autocomplete.findByLabel('Effect').click();

            ui.autocompletePopper
              .findByTitle(newTaint.effect)
              .should('be.visible')
              .should('be.enabled')
              .click();

            ui.button.findByTitle('Add').click();

            // Confirm add form closes and Add Taint button is re-enabled.
            cy.findByLabelText('Taint').should('not.exist');
            cy.findByLabelText('Add').should('not.exist');
            ui.button.findByTitle('Add Taint').should('be.enabled');

            // Confirm new taint is visible in table.
            cy.get(`tr[data-qa-taint-row="${newTaint.key}"]`)
              .should('be.visible')
              .within(() => {
                cy.findByText(`${newTaint.key}: ${newTaint.value}`).should(
                  'be.visible'
                );
                cy.findByText(newTaint.effect).should('be.visible');
              });

            if (index === 0) {
              ui.button.findByTitle('Add Taint').click();
            }
          });

          // Confirm form can be submitted.
          ui.button
            .findByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm request has the correct data.
      cy.wait('@updateNodePool').then((xhr) => {
        const data = xhr.response?.body;
        if (data) {
          const actualLabels: Label = data.labels;
          const actualTaints: Taint[] = data.taints;
          console.log({ actualTaints }, { actualLabels });

          expect(actualLabels).to.deep.equal(mockNodePoolUpdated.labels);
          expect(actualTaints).to.deep.equal(mockNodePoolUpdated.taints);
        }
      });

      cy.wait('@getNodePoolsUpdated');

      // Confirm drawer closes.
      cy.findByText(mockDrawerTitle).should('not.exist');
    });

    it('can handle validation and errors for labels and taints', () => {
      const invalidDNSSubdomainLabel = `my-app/${randomString(129)}`;
      const invalidLabels = [
        'label with spaces',
        'key-and-no-value',
        randomString(64),
        invalidDNSSubdomainLabel,
        'valid-key: invalid value',
        '%invalid-character: value',
        'example.com/myapp: %invalid-character',
        'kubernetes.io: value',
        'linode.com: value',
      ];

      const invalidTaintKeys = [
        randomString(254),
        'key with spaces',
        '!invalid-characters',
      ];
      const invalidTaintValues = [
        `key:${randomString(64)}`,
        'key: kubernetes.io',
        'key: linode.com',
        'key:value with spaces',
      ];

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait([
        '@getCluster',
        '@getNodePools',
        '@getVersions',
        '@getType',
        '@getControlPlaneAcl',
      ]);
      const mockErrorMessage = 'API Error';

      mockUpdateNodePoolError(
        mockCluster.id,
        mockNodePoolInitial,
        mockErrorMessage
      ).as('updateNodePoolError');

      // Click "Labels and Taints" button and confirm drawer contents.
      ui.button
        .findByTitle('Labels and Taints')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(mockDrawerTitle)
        .should('be.visible')
        .within(() => {
          ui.button.findByTitle('Add Label').click();

          // Try to submit without adding a label.
          ui.button.findByTitle('Add').click();

          // Confirm error validation for invalid label input.
          cy.findByText('Labels must be valid key-value pairs.').should(
            'be.visible'
          );

          invalidLabels.forEach((invalidLabel) => {
            cy.findByLabelText('Label').click();
            cy.focused().clear();
            cy.focused().type(invalidLabel);

            // Try to submit with invalid label.
            ui.button.findByTitle('Add').click();

            // Confirm error validation for invalid label input.
            cy.findByText('Labels must be valid key-value pairs.').should(
              'be.visible'
            );
          });

          // Submit a valid label to enable the 'Save Changes' button.
          cy.findByLabelText('Label').click();
          cy.focused().clear();
          cy.focused().type('mockKey: mockValue');

          ui.button.findByTitle('Add').click();

          ui.button.findByTitle('Add Taint').click();

          // Try to submit without adding a taint.
          ui.button.findByTitle('Add').click();

          // Confirm error validation for invalid taint input.
          cy.findByText('Key is required.').should('be.visible');

          invalidTaintKeys.forEach((invalidTaintKey, index) => {
            cy.findByLabelText('Taint').click();
            cy.focused().clear();
            cy.focused().type(invalidTaintKey);

            // Try to submit taint with invalid key.
            ui.button.findByTitle('Add').click();

            if (index === 0) {
              cy.findByText('Key must be between 1 and 253 characters.').should(
                'be.visible'
              );
            } else {
              cy.findByText(/Key must start with a letter or number/).should(
                'be.visible'
              );
            }
          });

          invalidTaintValues.forEach((invalidTaintValue, index) => {
            cy.findByLabelText('Taint').click();
            cy.focused().clear();
            cy.focused().type(invalidTaintValue);

            // Try to submit taint with invalid value.
            ui.button.findByTitle('Add').click();

            if (index === 0) {
              cy.findByText(
                'Value must be between 0 and 63 characters.'
              ).should('be.visible');
            } else if (index === invalidTaintValues.length - 1) {
              cy.findByText(/Value must start with a letter or number/).should(
                'be.visible'
              );
            } else {
              cy.findByText(
                'Value cannot be "kubernetes.io" or "linode.com".'
              ).should('be.visible');
            }
          });

          ui.button.findByAttribute('data-testid', 'cancel-taint').click();

          // Try to submit form, but mock an API error.
          ui.button
            .findByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm error message shows when API request fails.
      cy.wait('@updateNodePoolError');
      cy.findAllByText(mockErrorMessage).should('be.visible');
    });
  });

  it('does not collapse the accordion when an action button is clicked in the accordion header', () => {
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
    });
    const mockSingleNodePool = mockNodePools[0];
    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, [mockSingleNodePool]).as(
      'getNodePools'
    );

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools']);

    cy.get(`[data-qa-node-pool-id="${mockSingleNodePool.id}"]`).within(() => {
      // Accordion should be expanded by default
      cy.get(`[data-qa-panel-summary]`).should(
        'have.attr',
        'aria-expanded',
        'true'
      );

      // Click on a disabled button
      cy.get('[data-testid="node-pool-actions"]')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Delete Pool')
            .should('be.visible')
            .should('be.disabled')
            .click();
        });

      // Check that the accordion is still expanded
      cy.get(`[data-qa-panel-summary]`).should(
        'have.attr',
        'aria-expanded',
        'true'
      );

      // Click on an action button
      cy.get('[data-testid="node-pool-actions"]')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Autoscale Pool')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });
    });

    // Exit dialog
    ui.dialog
      .findByTitle('Autoscale Pool')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.get(`[data-qa-node-pool-id="${mockSingleNodePool.id}"]`).within(() => {
      // Check that the accordion is still expanded
      cy.get(`[data-qa-panel-summary]`).should(
        'have.attr',
        'aria-expanded',
        'true'
      );

      // Accordion should close on non-action button clicks
      cy.get('[data-qa-panel-subheading]').click();
      cy.get(`[data-qa-panel-summary]`).should(
        'have.attr',
        'aria-expanded',
        'false'
      );
    });
  });

  it('sets default expanded node pools and has collapse/expand all functionality', () => {
    const mockCluster = kubernetesClusterFactory.build({
      k8s_version: latestKubernetesVersion,
    });
    const mockNodePools = [
      nodePoolFactory.build({
        count: 10,
        nodes: kubeLinodeFactory.buildList(10),
      }),
      nodePoolFactory.build({
        count: 5,
        nodes: kubeLinodeFactory.buildList(5),
      }),
      nodePoolFactory.build({ nodes: [kubeLinodeFactory.build()] }),
    ];
    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools']);

    cy.get(`[data-qa-node-pool-id="${mockNodePools[0].id}"]`).within(() => {
      // Accordion should be collapsed by default since there are more than 9 nodes
      cy.get(`[data-qa-panel-summary]`).should(
        'have.attr',
        'aria-expanded',
        'false'
      );
    });

    cy.get(`[data-qa-node-pool-id="${mockNodePools[1].id}"]`).within(() => {
      // Accordion should be expanded by default since there are not more than 9 nodes
      cy.get(`[data-qa-panel-summary]`).should(
        'have.attr',
        'aria-expanded',
        'true'
      );
    });

    cy.get(`[data-qa-node-pool-id="${mockNodePools[2].id}"]`).within(() => {
      // Accordion should be expanded by default since there are not more than 9 nodes
      cy.get(`[data-qa-panel-summary]`).should(
        'have.attr',
        'aria-expanded',
        'true'
      );
    });

    // Collapse all pools
    ui.button
      .findByTitle('Collapse All Pools')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.get(`[data-qa-node-pool-id]`).each(($pool) => {
      // Accordion should be collapsed
      cy.wrap($pool).within(() => {
        cy.get(`[data-qa-panel-summary]`).should(
          'have.attr',
          'aria-expanded',
          'false'
        );
      });
    });

    // Expand all pools
    ui.button
      .findByTitle('Expand All Pools')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.get(`[data-qa-node-pool-id]`).each(($pool) => {
      // Accordion should be expanded
      cy.wrap($pool).within(() => {
        cy.get(`[data-qa-panel-summary]`).should(
          'have.attr',
          'aria-expanded',
          'true'
        );
      });
    });
  });

  it('filters the node tables based on selected status filter', () => {
    const mockCluster = kubernetesClusterFactory.build({
      created: DateTime.local().toISO(),
      k8s_version: latestKubernetesVersion,
      tier: 'enterprise',
    });
    const mockNodePools = [
      nodePoolFactory.build({
        count: 4,
        nodes: [
          ...kubeLinodeFactory.buildList(3),
          kubeLinodeFactory.build({ status: 'not_ready' }),
        ],
      }),
      nodePoolFactory.build({
        count: 2,
        nodes: kubeLinodeFactory.buildList(2),
      }),
    ];
    const mockLinodes: Linode[] = [
      linodeFactory.build({
        id: mockNodePools[0].nodes[0].instance_id ?? undefined,
      }),
      linodeFactory.build({
        id: mockNodePools[0].nodes[1].instance_id ?? undefined,
      }),
      linodeFactory.build({
        id: mockNodePools[0].nodes[2].instance_id ?? undefined,
        status: 'offline',
      }),
      linodeFactory.build({
        id: mockNodePools[0].nodes[3].instance_id ?? undefined,
        status: 'provisioning',
      }),
      linodeFactory.build({
        id: mockNodePools[1].nodes[0].instance_id ?? undefined,
      }),
      linodeFactory.build({
        id: mockNodePools[1].nodes[1].instance_id ?? undefined,
        status: 'offline',
      }),
    ];
    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockGetLinodes(mockLinodes).as('getLinodes');

    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getCluster', '@getNodePools', '@getLinodes']);

    // Filter is initially set to Show All nodes
    cy.findByText(
      'Nodes will appear once cluster provisioning is complete.'
    ).should('not.exist');
    cy.get(`[data-qa-node-pool-id="${mockNodePools[0].id}"]`).within(() => {
      cy.get('[data-qa-node-row]').should('have.length', 4);
    });
    cy.get(`[data-qa-node-pool-id="${mockNodePools[1].id}"]`).within(() => {
      cy.get('[data-qa-node-row]').should('have.length', 2);
    });

    // Filter by Running status
    ui.autocomplete.findByLabel('Status').click();
    ui.autocompletePopper.findByTitle('Running').should('be.visible').click();

    // Only Running nodes should be displayed
    cy.findByText(
      'Nodes will appear once cluster provisioning is complete.'
    ).should('not.exist');
    cy.get(`[data-qa-node-pool-id="${mockNodePools[0].id}"]`).within(() => {
      cy.get('[data-qa-node-row]').should('have.length', 2);
    });
    cy.get(`[data-qa-node-pool-id="${mockNodePools[1].id}"]`).within(() => {
      cy.get('[data-qa-node-row]').should('have.length', 1);
    });

    // Filter by Offline status
    ui.autocomplete.findByLabel('Status').click();
    ui.autocompletePopper.findByTitle('Offline').should('be.visible').click();

    // Only Offline nodes should be displayed
    cy.findByText(
      'Nodes will appear once cluster provisioning is complete.'
    ).should('not.exist');
    cy.get(`[data-qa-node-pool-id="${mockNodePools[0].id}"]`).within(() => {
      cy.get('[data-qa-node-row]').should('have.length', 1);
    });
    cy.get(`[data-qa-node-pool-id="${mockNodePools[1].id}"]`).within(() => {
      cy.get('[data-qa-node-row]').should('have.length', 1);
    });

    // Filter by Provisioning status
    ui.autocomplete.findByLabel('Status').click();
    ui.autocompletePopper
      .findByTitle('Provisioning')
      .should('be.visible')
      .click();

    // Only Provisioning nodes should be displayed
    cy.findByText(
      'Nodes will appear once cluster provisioning is complete.'
    ).should('not.exist');
    cy.get(`[data-qa-node-pool-id="${mockNodePools[0].id}"]`).within(() => {
      cy.get('[data-qa-node-row]').should('have.length', 1);
    });
    cy.get(`[data-qa-node-pool-id="${mockNodePools[1].id}"]`).within(() => {
      cy.get('[data-qa-node-row]').should('have.length', 0);
    });

    // Filter by Show All status
    ui.autocomplete.findByLabel('Status').click();
    ui.autocompletePopper.findByTitle('Show All').should('be.visible').click();

    // All nodes are displayed
    cy.findByText(
      'Nodes will appear once cluster provisioning is complete.'
    ).should('not.exist');
    cy.get(`[data-qa-node-pool-id="${mockNodePools[0].id}"]`).within(() => {
      cy.get('[data-qa-node-row]').should('have.length', 4);
    });
    cy.get(`[data-qa-node-pool-id="${mockNodePools[1].id}"]`).within(() => {
      cy.get('[data-qa-node-row]').should('have.length', 2);
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
      const dcSpecificPricingRegion = extendRegion(
        regionFactory.build({
          capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
          id: 'us-east',
        })
      );
      mockGetRegions([dcSpecificPricingRegion]).as('getRegions');
      const mockPlanType = extendType(dcPricingMockLinodeTypes[0]);

      const mockCluster = kubernetesClusterFactory.build({
        control_plane: {
          high_availability: false,
        },
        k8s_version: latestKubernetesVersion,
        region: dcSpecificPricingRegion.id,
      });

      const mockNodePoolResized = nodePoolFactory.build({
        count: 3,
        nodes: kubeLinodeFactory.buildList(3),
        type: mockPlanType.id,
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
            type: mockPlanType.id,
          });
        }
      );

      const mockNodePoolDrawerTitle = `Resize Pool: ${mockPlanType.formattedLabel} Plan`;

      mockGetCluster(mockCluster).as('getCluster');
      mockGetClusterPools(mockCluster.id, [mockNodePoolInitial]).as(
        'getNodePools'
      );
      mockGetLinodes(mockLinodes).as('getLinodes');
      mockGetLinodeType(mockPlanType).as('getLinodeType');
      mockGetKubernetesVersions().as('getVersions');
      mockGetDashboardUrl(mockCluster.id);
      mockGetApiEndpoints(mockCluster.id);

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait([
        '@getRegions',
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
            'Current price: $14.40/month (1 node at $14.40/month each)'
          ).should('be.visible');
          cy.findByText(
            'Resized price: $14.40/month (1 node at $14.40/month each)'
          ).should('be.visible');

          cy.findByLabelText('Add 1')
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.focused().click();
          cy.focused().click();

          cy.findByLabelText('Edit Quantity').should('have.value', '4');
          cy.findByText(
            'Current price: $14.40/month (1 node at $14.40/month each)'
          ).should('be.visible');
          cy.findByText(
            'Resized price: $57.60/month (4 nodes at $14.40/month each)'
          ).should('be.visible');

          cy.findByLabelText('Subtract 1')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.findByLabelText('Edit Quantity').should('have.value', '3');
          cy.findByText(
            'Resized price: $43.20/month (3 nodes at $14.40/month each)'
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
      const dcSpecificPricingRegion = extendRegion(
        regionFactory.build({
          capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
          id: 'us-east',
        })
      );
      mockGetRegions([dcSpecificPricingRegion]).as('getRegions');
      const mockCluster = kubernetesClusterFactory.build({
        control_plane: {
          high_availability: false,
        },
        k8s_version: latestKubernetesVersion,
        region: dcSpecificPricingRegion.id,
      });

      const mockPlanType = extendType(dcPricingMockLinodeTypes[0]);

      const mockNewNodePool = nodePoolFactory.build({
        count: 2,
        nodes: kubeLinodeFactory.buildList(2),
        type: mockPlanType.id,
      });

      const mockNodePool = nodePoolFactory.build({
        count: 1,
        nodes: kubeLinodeFactory.buildList(1),
        type: mockPlanType.id,
      });

      mockGetCluster(mockCluster).as('getCluster');
      mockGetClusterPools(mockCluster.id, [mockNodePool]).as('getNodePools');
      mockGetKubernetesVersions().as('getVersions');
      mockAddNodePool(mockCluster.id, mockNewNodePool).as('addNodePool');
      mockGetLinodeType(mockPlanType).as('getLinodeType');
      mockGetLinodeTypes(dcPricingMockLinodeTypes);
      mockGetDashboardUrl(mockCluster.id);
      mockGetApiEndpoints(mockCluster.id);

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait([
        '@getRegions',
        '@getCluster',
        '@getNodePools',
        '@getVersions',
        '@getLinodeType',
      ]);

      // Assert that initial node pool is shown on the page.
      cy.findByText(mockPlanType.formattedLabel, { selector: 'h2' }).should(
        'be.visible'
      );

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
          cy.findByText('Shared CPU')
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.findByText(mockPlanType.formattedLabel)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              // Assert that DC-specific prices are displayed the plan table, then add a node pool with 2 linodes.
              cy.findByText('$14.40').should('be.visible');
              cy.findByText('$0.021').should('be.visible');
              cy.findByLabelText('Add 1').should('be.visible').click();
              cy.focused().click();
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

    /*
     * - Confirms node pool resize UI flow using mocked API responses.
     * - Confirms that pool size can be changed.
     * - Confirms that drawer reflects $0 pricing.
     * - Confirms that details page still shows $0 pricing after resizing.
     */
    it('can resize pools with region prices of $0', () => {
      const dcSpecificPricingRegion = extendRegion(
        regionFactory.build({
          capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
          id: 'us-southeast',
        })
      );
      mockGetRegions([dcSpecificPricingRegion]).as('getRegions');
      const mockPlanType = extendType(dcPricingMockLinodeTypes[2]);

      const mockCluster = kubernetesClusterFactory.build({
        control_plane: {
          high_availability: false,
        },
        k8s_version: latestKubernetesVersion,
        region: dcSpecificPricingRegion.id,
      });

      const mockNodePoolResized = nodePoolFactory.build({
        count: 3,
        nodes: kubeLinodeFactory.buildList(3),
        type: mockPlanType.id,
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
            type: mockPlanType.id,
          });
        }
      );

      const mockNodePoolDrawerTitle = `Resize Pool: ${mockPlanType.formattedLabel} Plan`;

      mockGetCluster(mockCluster).as('getCluster');
      mockGetClusterPools(mockCluster.id, [mockNodePoolInitial]).as(
        'getNodePools'
      );
      mockGetLinodes(mockLinodes).as('getLinodes');
      mockGetLinodeType(mockPlanType).as('getLinodeType');
      mockGetKubernetesVersions().as('getVersions');
      mockGetDashboardUrl(mockCluster.id);
      mockGetApiEndpoints(mockCluster.id);

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait([
        '@getRegions',
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
      cy.findByText('$0.00/month').should('be.visible');

      // Click "Resize Pool" and increase size to 4 nodes.
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
            'Current price: $0/month (1 node at $0/month each)'
          ).should('be.visible');
          cy.findByText(
            'Resized price: $0/month (1 node at $0/month each)'
          ).should('be.visible');

          cy.findByLabelText('Add 1')
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.focused().click();
          cy.focused().click();

          cy.findByLabelText('Edit Quantity').should('have.value', '4');
          cy.findByText(
            'Current price: $0/month (1 node at $0/month each)'
          ).should('be.visible');
          cy.findByText(
            'Resized price: $0/month (4 nodes at $0/month each)'
          ).should('be.visible');

          ui.button
            .findByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait(['@resizeNodePool', '@getNodePools']);

      // Confirm total price is still $0 in Kube Specs.
      cy.findByText('$0.00/month').should('be.visible');
    });

    /*
     * - Confirms UI flow when adding node pools using mocked API responses.
     * - Confirms that drawer reflects $0 prices.
     * - Confirms that details page still shows $0 pricing after adding node pool.
     */
    it('can add node pools with region prices of $0', () => {
      const dcSpecificPricingRegion = extendRegion(
        regionFactory.build({
          capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
          id: 'us-southeast',
        })
      );
      mockGetRegions([dcSpecificPricingRegion]).as('getRegions');
      const mockPlanType = extendType(dcPricingMockLinodeTypes[2]);

      const mockCluster = kubernetesClusterFactory.build({
        control_plane: {
          high_availability: false,
        },
        k8s_version: latestKubernetesVersion,
        region: dcSpecificPricingRegion.id,
      });

      const mockNewNodePool = nodePoolFactory.build({
        count: 2,
        nodes: kubeLinodeFactory.buildList(2),
        type: mockPlanType.id,
      });

      const mockNodePool = nodePoolFactory.build({
        count: 1,
        nodes: kubeLinodeFactory.buildList(1),
        type: mockPlanType.id,
      });

      mockGetCluster(mockCluster).as('getCluster');
      mockGetClusterPools(mockCluster.id, [mockNodePool]).as('getNodePools');
      mockGetKubernetesVersions().as('getVersions');
      mockAddNodePool(mockCluster.id, mockNewNodePool).as('addNodePool');
      mockGetLinodeType(mockPlanType).as('getLinodeType');
      mockGetLinodeTypes(dcPricingMockLinodeTypes);
      mockGetDashboardUrl(mockCluster.id);
      mockGetApiEndpoints(mockCluster.id);

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait([
        '@getRegions',
        '@getCluster',
        '@getNodePools',
        '@getVersions',
        '@getLinodeType',
      ]);

      // Assert that initial node pool is shown on the page.
      cy.findByText(mockPlanType.formattedLabel, { selector: 'h2' }).should(
        'be.visible'
      );

      // Confirm total price of $0 is listed in Kube Specs.
      cy.findByText('$0.00/month').should('be.visible');

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
          cy.findByText('Shared CPU')
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.findByText('Linode 2 GB')
            .should('be.visible')
            .closest('tr')
            .within(() => {
              // Assert that $0 prices are displayed the plan table, then add a node pool with 2 linodes.
              cy.findAllByText('$0').should('have.length', 2);
              cy.findByLabelText('Add 1').should('be.visible').click();
              cy.focused().click();
            });

          // Assert that $0 prices are displayed as helper text.
          cy.contains(
            'This pool will add $0/month (2 nodes at $0/month) to this cluster.'
          ).should('be.visible');

          ui.button
            .findByTitle('Add pool')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Wait for API responses.
      cy.wait(['@addNodePool', '@getNodePools']);

      // Confirm total price is still $0 in Kube Specs.
      cy.findByText('$0.00/month').should('be.visible');
    });
  });
});

describe('LKE ACL updates', () => {
  const mockCluster = kubernetesClusterFactory.build();
  const mockRevisionId = randomString(20);

  /**
   * - Confirms LKE ACL is only rendered if an account has the corresponding capability
   */
  it('does not show ACL without the LKE ACL capability', () => {
    mockGetAccount(
      accountFactory.build({
        capabilities: [],
      })
    ).as('getAccount');

    mockGetCluster(mockCluster).as('getCluster');
    cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
    cy.wait(['@getAccount', '@getCluster']);

    cy.contains('Control Plane ACL').should('not.exist');
  });

  describe('with LKE ACL account capability', () => {
    beforeEach(() => {
      mockGetAccount(
        accountFactory.build({
          capabilities: ['LKE Network Access Control List (IP ACL)'],
        })
      ).as('getAccount');
    });

    /**
     * - Confirms ACL can be enabled from the summary page
     * - Confirms revision ID can be updated
     * - Confirms both IPv4 and IPv6 can be updated and that summary page and drawer updates as a result
     */
    it('can enable ACL on an LKE cluster with ACL pre-installed and edit IPs', () => {
      const mockACLOptions = kubernetesControlPlaneACLOptionsFactory.build({
        addresses: { ipv4: ['10.0.3.0/24'], ipv6: undefined },
        enabled: false,
      });
      const mockUpdatedACLOptions1 =
        kubernetesControlPlaneACLOptionsFactory.build({
          addresses: { ipv4: ['10.0.0.0/24'], ipv6: undefined },
          enabled: true,
          'revision-id': mockRevisionId,
        });
      const mockControlPaneACL = kubernetesControlPlaneACLFactory.build({
        acl: mockACLOptions,
      });
      const mockUpdatedControlPlaneACL1 =
        kubernetesControlPlaneACLFactory.build({
          acl: mockUpdatedACLOptions1,
        });

      mockGetCluster(mockCluster).as('getCluster');
      mockGetControlPlaneACL(mockCluster.id, mockControlPaneACL).as(
        'getControlPlaneACL'
      );
      mockUpdateControlPlaneACL(mockCluster.id, mockUpdatedControlPlaneACL1).as(
        'updateControlPlaneACL'
      );

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait(['@getAccount', '@getCluster', '@getControlPlaneACL']);

      // confirm summary panel
      cy.contains('Control Plane ACL').should('be.visible');
      ui.button
        .findByTitle('Enable')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(`Control Plane ACL for ${mockCluster.label}`)
        .should('be.visible')
        .within(() => {
          // Confirm submit button is disabled if form has not been changed
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('not.be.enabled');

          // Enable ACL
          cy.contains('Activation Status').should('be.visible');
          ui.toggle
            .find()
            .should('have.attr', 'data-qa-toggle', 'false')
            .should('be.visible')
            .click();

          // confirm submit button is now enabled
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled');

          // Edit Revision ID
          cy.findByLabelText('Revision ID').should(
            'have.value',
            mockACLOptions['revision-id']
          );
          cy.findByLabelText('Revision ID').clear();
          cy.focused().type(mockRevisionId);

          // Addresses section: confirm current IPv4 value and enter new IP
          cy.findByDisplayValue('10.0.3.0/24').should('be.visible').click();
          cy.focused().clear();
          cy.focused().type('10.0.0.0/24');

          // submit
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait(['@updateControlPlaneACL']);

      // confirm summary panel updates
      cy.contains('Control Plane ACL').should('be.visible');
      cy.findByText('Enable').should('not.exist');
      ui.button
        .findByTitle('Enabled (1 IP Address)')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // update mocks
      const mockUpdatedACLOptions2 =
        kubernetesControlPlaneACLOptionsFactory.build({
          addresses: {
            ipv4: ['10.0.0.0/24'],
            ipv6: [
              '8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e',
              'f4a2:b849:4a24:d0d9:15f0:704b:f943:718f',
            ],
          },
          enabled: true,
          'revision-id': mockRevisionId,
        });
      const mockUpdatedControlPlaneACL2 =
        kubernetesControlPlaneACLFactory.build({
          acl: mockUpdatedACLOptions2,
        });
      mockUpdateControlPlaneACL(mockCluster.id, mockUpdatedControlPlaneACL2).as(
        'updateControlPlaneACL2'
      );

      // confirm data within drawer is updated and edit IPs again
      ui.drawer
        .findByTitle(`Control Plane ACL for ${mockCluster.label}`)
        .should('be.visible')
        .within(() => {
          // Confirm submit button is disabled if form has not been changed
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('not.be.enabled');

          // confirm enable toggle was updated
          ui.toggle
            .find()
            .should('have.attr', 'data-qa-toggle', 'true')
            .should('be.visible');

          // confirm Revision ID was updated
          cy.findByLabelText('Revision ID').should(
            'have.value',
            mockRevisionId
          );

          // clear Revision ID
          cy.findByLabelText('Revision ID').clear();

          // update IPv6 addresses
          cy.findByDisplayValue('10.0.0.0/24').should('be.visible');
          cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .click();
          cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
          cy.findByText('Add IPv6 Address')
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-1')
            .should('be.visible')
            .click();
          cy.focused().type('f4a2:b849:4a24:d0d9:15f0:704b:f943:718f');

          // submit
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait(['@updateControlPlaneACL2']);

      // confirm summary panel updates
      cy.contains('Control Plane ACL').should('be.visible');
      cy.findByText('Enable').should('not.exist');
      ui.button
        .findByTitle('Enabled (3 IP Addresses)')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // confirm data within drawer is updated again
      ui.drawer
        .findByTitle(`Control Plane ACL for ${mockCluster.label}`)
        .should('be.visible')
        .within(() => {
          // confirm Revision ID was "regenerated" after being cleared instead of displaying an empty string
          cy.findByLabelText('Revision ID').should(
            'have.value',
            mockRevisionId
          );
          // confirm updated IPv6 addresses display
          cy.findByDisplayValue(
            '8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e'
          ).should('be.visible');
          cy.findByDisplayValue(
            'f4a2:b849:4a24:d0d9:15f0:704b:f943:718f'
          ).should('be.visible');
        });
    });

    /**
     * - Confirms ACL can be disabled from the summary page (for standard tier only)
     */
    it('can disable ACL on a standard tier cluster', () => {
      const mockACLOptions = kubernetesControlPlaneACLOptionsFactory.build({
        addresses: {
          ipv4: [],
          ipv6: [],
        },
        enabled: true,
      });

      const mockDisabledACLOptions =
        kubernetesControlPlaneACLOptionsFactory.build({
          addresses: {
            ipv4: [''],
            ipv6: [''],
          },
          enabled: false,
          'revision-id': '',
        });
      const mockControlPaneACL = kubernetesControlPlaneACLFactory.build({
        acl: mockACLOptions,
      });
      const mockUpdatedControlPlaneACL = kubernetesControlPlaneACLFactory.build(
        {
          acl: mockDisabledACLOptions,
        }
      );

      mockGetCluster(mockCluster).as('getCluster');
      mockGetControlPlaneACL(mockCluster.id, mockControlPaneACL).as(
        'getControlPlaneACL'
      );
      mockUpdateControlPlaneACL(mockCluster.id, mockUpdatedControlPlaneACL).as(
        'updateControlPlaneACL'
      );

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait(['@getAccount', '@getCluster', '@getControlPlaneACL']);

      // confirm summary panel
      cy.contains('Control Plane ACL').should('be.visible');
      ui.button
        .findByTitle('Enabled (0 IP Addresses)')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(`Control Plane ACL for ${mockCluster.label}`)
        .should('be.visible')
        .within(() => {
          // Confirm submit button is disabled if form has not been changed
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('not.be.enabled');

          // Activation Status section: toggle off 'Enable'
          cy.contains('Activation Status').should('be.visible');
          ui.toggle
            .find()
            .should('have.attr', 'data-qa-toggle', 'true')
            .should('be.visible')
            .click();

          // confirm submit button is now enabled
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled');

          // confirm Revision ID section
          cy.findByLabelText('Revision ID').should(
            'have.value',
            mockDisabledACLOptions['revision-id']
          );

          // confirm IPv4 and IPv6 address sections
          cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .should('have.value', mockDisabledACLOptions.addresses?.ipv4?.[0]);
          cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .should('have.value', mockDisabledACLOptions.addresses?.ipv6?.[0]);

          // submit
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait(['@updateControlPlaneACL']);

      // confirm summary panel updates
      cy.contains('Control Plane ACL').should('be.visible');
      cy.findByText('Enabled (0 IP Addresses)').should('not.exist');
      ui.button
        .findByTitle('Enable')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // confirm data within drawer is updated
      ui.drawer
        .findByTitle(`Control Plane ACL for ${mockCluster.label}`)
        .should('be.visible')
        .within(() => {
          // confirm enable toggle was updated
          ui.toggle
            .find()
            .should('have.attr', 'data-qa-toggle', 'false')
            .should('be.visible');

          // confirm Revision ID section remains empty
          cy.findByLabelText('Revision ID').should(
            'have.value',
            mockDisabledACLOptions['revision-id']
          );

          // confirm IPv4 and IPv6 address sections remain empty
          cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .should('have.value', mockDisabledACLOptions.addresses?.ipv4?.[0]);
          cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .should('have.value', mockDisabledACLOptions.addresses?.ipv6?.[0]);
        });
    });

    /**
     * - Confirms ACL can be enabled from the summary page when cluster does not have ACL pre-installed
     * - Confirms drawer appearance when APL is not pre-installed
     * - Confirms that request to correct endpoint is sent
     */
    it('can enable ACL on an LKE cluster with ACL not pre-installed and edit IPs', () => {
      const mockACLOptions = kubernetesControlPlaneACLOptionsFactory.build({
        addresses: { ipv4: ['10.0.0.0/24'] },
        enabled: true,
      });
      const mockControlPaneACL = kubernetesControlPlaneACLFactory.build({
        acl: mockACLOptions,
      });

      mockGetCluster(mockCluster).as('getCluster');
      mockGetControlPlaneACLError(mockCluster.id).as('getControlPlaneACLError');
      mockUpdateCluster(mockCluster.id, {
        ...mockCluster,
        control_plane: mockControlPaneACL,
      }).as('updateCluster');
      mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait([
        '@getAccount',
        '@getCluster',
        '@getControlPlaneACLError',
        '@getNodePools',
      ]);

      cy.contains('Control Plane ACL').should('be.visible');
      cy.findAllByTestId('circle-progress').should('be.visible');

      // query retries once if failed
      cy.wait('@getControlPlaneACLError');

      ui.button
        .findByTitle('Enable')
        .should('be.visible')
        .should('be.enabled')
        .click();

      mockGetControlPlaneACL(mockCluster.id, mockControlPaneACL).as(
        'getControlPlaneACL'
      );

      ui.drawer
        .findByTitle(`Control Plane ACL for ${mockCluster.label}`)
        .should('be.visible')
        .within(() => {
          // Confirm installation notice is displayed
          cy.contains(
            'Control Plane ACL has not yet been installed on this cluster. During installation, it may take up to 15 minutes for the access control list to be fully enforced.'
          ).should('be.visible');

          // Confirm Activation Status section and Enable ACL
          cy.contains('Activation Status').should('be.visible');
          ui.toggle
            .find()
            .should('have.attr', 'data-qa-toggle', 'false')
            .should('be.visible')
            .click();

          // Revision ID section does not exist
          cy.contains('Revision ID').should('not.exist');

          // Addresses section: add IP addresses
          cy.findByText('Addresses').should('be.visible');
          cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .click();
          cy.focused().type('10.0.0.0/24');

          cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .click();
          cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');

          // submit
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait(['@updateCluster', '@getControlPlaneACL']);

      // confirm summary panel updates
      cy.contains('Control Plane ACL').should('be.visible');
      cy.findByText('Enabled (2 IP Addresses)').should('be.exist');
    });

    /**
     * - Confirms IP validation error appears when a bad IP is entered
     * - Confirms IP validation error disappears when a valid IP is entered
     * - Confirms API error appears as expected and doesn't crash the page
     */
    it('can handle validation and API errors', () => {
      const mockACLOptions = kubernetesControlPlaneACLOptionsFactory.build({
        addresses: { ipv4: undefined, ipv6: undefined },
        enabled: true,
      });
      const mockControlPaneACL = kubernetesControlPlaneACLFactory.build({
        acl: mockACLOptions,
      });
      const mockErrorMessage = 'Control Plane ACL error: failed to update ACL';

      mockGetCluster(mockCluster).as('getCluster');
      mockGetControlPlaneACL(mockCluster.id, mockControlPaneACL).as(
        'getControlPlaneACL'
      );

      mockUpdateControlPlaneACLError(mockCluster.id, mockErrorMessage, 400).as(
        'updateControlPlaneACLError'
      );

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}`);
      cy.wait(['@getAccount', '@getCluster', '@getControlPlaneACL']);

      // confirm summary panel
      cy.contains('Control Plane ACL').should('be.visible');
      ui.button
        .findByTitle('Enabled (0 IP Addresses)')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(`Control Plane ACL for ${mockCluster.label}`)
        .should('be.visible')
        .within(() => {
          // Confirm ACL IP validation works as expected for IPv4
          cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .click();
          cy.focused().type('invalid ip');
          // click out of textbox and confirm error is visible
          cy.contains('Addresses').should('be.visible').click();
          cy.contains('Must be a valid IPv4 address.').should('be.visible');
          // enter valid IP
          cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .click();
          cy.focused().clear();
          cy.focused().type('10.0.0.0/24');
          // Click out of textbox and confirm error is gone
          cy.contains('Addresses').should('be.visible').click();
          cy.contains('Must be a valid IPv4 address.').should('not.exist');

          // Confirm ACL IP validation works as expected for IPv6
          cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .click();
          cy.focused().type('invalid ip');
          // click out of textbox and confirm error is visible
          cy.findByText('Addresses').should('be.visible').click();
          cy.contains('Must be a valid IPv6 address.').should('be.visible');
          // enter valid IP
          cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .click();
          cy.focused().clear();
          cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
          // Click out of textbox and confirm error is gone
          cy.findByText('Addresses').should('be.visible').click();
          cy.contains('Must be a valid IPv6 address.').should('not.exist');

          // submit
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait(['@updateControlPlaneACLError']);
      cy.contains(mockErrorMessage).should('be.visible');
    });

    it('can handle validation for an enterprise cluster', () => {
      const mockEnterpriseCluster = kubernetesClusterFactory.build({
        tier: 'enterprise',
      });
      const mockACLOptions = kubernetesControlPlaneACLOptionsFactory.build({
        addresses: { ipv4: [], ipv6: [] },
        enabled: true,
      });
      const mockUpdatedOptions = kubernetesControlPlaneACLOptionsFactory.build({
        addresses: {
          ipv4: [],
          ipv6: ['8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e'],
        },
        enabled: true,
      });
      const mockControlPaneACL = kubernetesControlPlaneACLFactory.build({
        acl: mockACLOptions,
      });
      const mockUpdatedControlPaneACL = kubernetesControlPlaneACLFactory.build({
        acl: mockUpdatedOptions,
      });

      mockGetCluster(mockEnterpriseCluster).as('getCluster');
      mockGetControlPlaneACL(mockEnterpriseCluster.id, mockControlPaneACL).as(
        'getControlPlaneACL'
      );
      mockUpdateControlPlaneACL(
        mockEnterpriseCluster.id,
        mockUpdatedControlPaneACL
      ).as('updateControlPlaneACL');

      cy.visitWithLogin(`/kubernetes/clusters/${mockEnterpriseCluster.id}`);
      cy.wait(['@getAccount', '@getCluster', '@getControlPlaneACL']);

      cy.contains('Control Plane ACL').should('be.visible');
      ui.button
        .findByTitle('Enabled (0 IP Addresses)')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(`Control Plane ACL for ${mockEnterpriseCluster.label}`)
        .should('be.visible')
        .within(() => {
          // Confirm the checkbox is not checked by default
          cy.findByRole('checkbox', { name: /Provide an ACL later/ }).should(
            'not.be.checked'
          );

          cy.findByLabelText('Revision ID').click();
          cy.focused().clear();
          cy.focused().type('1');

          // Try to submit the form without any IPs
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Confirm validation error prevents this
          cy.findByText(
            'At least one IP address or CIDR range is required for LKE Enterprise.'
          ).should('be.visible');

          // Add at least one IP
          cy.findByText('Add IPv6 Address').click();
          cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .click();
          cy.focused().clear();
          cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');

          // Resubmit the form
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Confirm error message disappears
          cy.findByText(
            'At least one IP address or CIDR range is required for LKE Enterprise.'
          ).should('not.exist');
        });

      cy.wait('@updateControlPlaneACL');

      ui.button
        .findByTitle('Enabled (1 IP Address)')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(`Control Plane ACL for ${mockEnterpriseCluster.label}`)
        .should('be.visible')
        .within(() => {
          // Clear the existing IP
          cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
            .should('be.visible')
            .click();
          cy.focused().clear();

          // Check the acknowledgement checkbox
          cy.findByRole('checkbox', { name: /Provide an ACL later/ }).click();

          // Confirm the form can submit without any IPs if the acknowledgement is checked
          ui.button
            .findByTitle('Update')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Confirm error message disappears
          cy.contains(
            'At least one IP address or CIDR range is required for LKE Enterprise.'
          ).should('not.exist');
        });
    });
  });
});
