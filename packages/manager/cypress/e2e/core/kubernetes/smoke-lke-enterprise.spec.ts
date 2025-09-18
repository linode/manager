/**
 * Tests basic functionality for LKE-E feature-flagged work.
 * TODO: M3-8838 - Delete this spec file once LKE-E is released to GA.
 */

import { linodeTypeFactory, regionFactory } from '@linode/utilities';
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
  mockTieredEnterpriseVersions,
  mockTieredStandardVersions,
} from 'support/constants/lke';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodeType,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';
import {
  mockCreateCluster,
  mockGetCluster,
  mockGetClusterPools,
  mockGetClusters,
  mockGetTieredKubernetesVersions,
} from 'support/intercepts/lke';
import {} from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVPC } from 'support/intercepts/vpc';
import { ui } from 'support/ui';
import { lkeClusterCreatePage } from 'support/ui/pages';
import { addNodes } from 'support/util/lke';
import { randomLabel } from 'support/util/random';

import { extendType } from 'src/utilities/extendType';

const mockCluster = kubernetesClusterFactory.build({
  id: 1,
  vpc_id: 123,
  label: randomLabel(),
  tier: 'enterprise',
});

const mockPlan = extendType(
  linodeTypeFactory.build({
    class: 'dedicated',
  })
);

const mockVPC = vpcFactory.build({
  id: 123,
  label: 'lke-e-vpc',
  subnets: [subnetFactory.build()],
});

const mockNodePools = [nodePoolFactory.build()];

// Mock a valid region for LKE-E to avoid test flake.
const mockRegion = regionFactory.build({
  capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise', 'VPCs'],
});

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
    mockGetRegions([mockRegion]);
    mockGetLinodeTypes([mockPlan]);
    mockGetLinodeType(mockPlan);
    mockGetTieredKubernetesVersions('standard', mockTieredStandardVersions);
    mockGetTieredKubernetesVersions('enterprise', mockTieredEnterpriseVersions);
    mockCreateCluster(mockCluster).as('createCluster');
  });

  /*
   * Smoke tests to confirm the state of the LKE Create page when the LKE-E
   * Post-LA feature flag is enabled and disabled.
   *
   * The Post-LA feature flag introduces the "Configure Node Pool" button and
   * flow when choosing node pools during the create flow. When disabled, it's
   * expected that users can add node pools from directly within the plan table.
   * When the flag is enabled, users instead select the plan they want and
   * configure the pool from within a new drawer. Additional configuration options
   * are available for LKE-E clusters as well.
   */
  describe('Post-LA feature flag', () => {
    /*
     * - Confirms the state of the LKE create page when the LKE-E "postLa" flag is enabled.
     * - Confirms that node pools are configured via new drawer.
     */
    it('Simple Page Check - Post LA Flag ON', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          postLa: true,
          phase2Mtc: { byoVPC: false, dualStack: false },
        },
      });

      cy.visitWithLogin('/kubernetes/create');

      lkeClusterCreatePage.setLabel(randomLabel());
      lkeClusterCreatePage.selectRegionById(mockRegion.id, [mockRegion]);
      lkeClusterCreatePage.selectPlanTab('Dedicated CPU');
      lkeClusterCreatePage.selectNodePoolPlan(mockPlan.formattedLabel);

      // Confirm that the "Configure Node Pool" drawer appears.
      lkeClusterCreatePage.withinNodePoolDrawer(mockPlan.formattedLabel, () => {
        ui.button
          .findByTitle('Add Pool')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      // Confirm that "Edit Configuration" button is shown for each node pool
      // in the order summary section.
      lkeClusterCreatePage.withinOrderSummary(() => {
        cy.contains(mockPlan.formattedLabel)
          .closest('[data-testid="node-pool-summary"]')
          .within(() => {
            cy.findByText('Edit Configuration').should('be.visible');
          });
      });
    });

    /*
     * - Confirms the state of the LKE create page when the LKE-E "postLa" flag is disabled.
     * - Confirms that node pools are added directly via the plan table.
     */
    it('Simple Page Check - Post LA Flag OFF', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          postLa: false,
          phase2Mtc: { byoVPC: false, dualStack: false },
        },
      });

      cy.visitWithLogin('/kubernetes/create');

      lkeClusterCreatePage.setLabel(randomLabel());
      lkeClusterCreatePage.selectRegionById(mockRegion.id, [mockRegion]);
      lkeClusterCreatePage.selectPlanTab('Dedicated CPU');

      // Add a node pool with a custom number of nodes, confirm that
      // it gets added to the summary as expected.
      lkeClusterCreatePage.addNodePool(mockPlan.formattedLabel, 5);

      lkeClusterCreatePage.withinOrderSummary(() => {
        cy.contains(mockPlan.formattedLabel)
          .closest('[data-testid="node-pool-summary"]')
          .within(() => {
            // Confirm that fields to edit the node pool size are present and enabled.
            cy.findByLabelText('Subtract 1')
              .should('be.visible')
              .should('be.enabled');
            cy.findByLabelText('Add 1')
              .should('be.visible')
              .should('be.enabled');
            cy.findByLabelText('Edit Quantity').should('have.value', '5');
          });
      });
    });
  });

  describe('Phase 2 MTC feature flag', () => {
    it('Simple Page Check - Phase 2 MTC BYO VPC Flag ON', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          postLa: false,
          phase2Mtc: { byoVPC: true, dualStack: false },
        },
      }).as('getFeatureFlags');

      cy.visitWithLogin('/kubernetes/create');
      cy.findByText('Add Node Pools').should('be.visible');

      cy.findByLabelText('Cluster Label').click();
      cy.focused().type(mockCluster.label);

      cy.findByText('LKE Enterprise').click();

      ui.regionSelect.find().click().type(`${mockRegion.label}`);
      ui.regionSelect.findItemByRegionId(mockRegion.id, [mockRegion]).click();

      cy.findByLabelText('Kubernetes Version').should('be.visible').click();
      cy.findByText(latestEnterpriseTierKubernetesVersion.id)
        .should('be.visible')
        .click();

      // Confirms LKE-E Phase 2 VPC options do not display with the Dual Stack flag OFF.
      cy.findByText('IP Stack').should('not.exist');
      cy.findByText('IPv4', { exact: true }).should('not.exist');
      cy.findByText('IPv4 + IPv6 (dual-stack)').should('not.exist');

      // Confirms LKE-E Phase 2 VPC options display with the BYO VPC flag ON.
      cy.findByText('Automatically generate a VPC for this cluster').should(
        'be.visible'
      );
      cy.findByText('Use an existing VPC').should('be.visible');

      cy.findByText('Dedicated CPU').should('be.visible').click();
      addNodes(mockPlan.formattedLabel);

      // Bypass ACL validation
      cy.get('input[name="acl-acknowledgement"]').check();

      // Confirm change is reflected in checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]').within(() => {
        cy.findByText(`${mockPlan.formattedLabel} Plan`).should('be.visible');
        cy.findByTitle(`Remove ${mockPlan.label} Node Pool`).should(
          'be.visible'
        );

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

    it('Simple Page Check - Phase 2 MTC Dual Stack Flag ON', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          postLa: false,
          phase2Mtc: { byoVPC: false, dualStack: true },
        },
      }).as('getFeatureFlags');

      cy.visitWithLogin('/kubernetes/create');
      cy.findByText('Add Node Pools').should('be.visible');

      cy.findByLabelText('Cluster Label').click();
      cy.focused().type(mockCluster.label);

      cy.findByText('LKE Enterprise').click();

      ui.regionSelect.find().click().type(`${mockRegion.label}`);
      ui.regionSelect.findItemByRegionId(mockRegion.id, [mockRegion]).click();

      cy.findByLabelText('Kubernetes Version').should('be.visible').click();
      cy.findByText(latestEnterpriseTierKubernetesVersion.id)
        .should('be.visible')
        .click();

      // Confirms LKE-E Phase 2 IP Stack displays with the Dual Stack flag ON.
      cy.findByText('IP Stack').should('be.visible');
      cy.findByText('IPv4', { exact: true }).should('be.visible');
      cy.findByText('IPv4 + IPv6 (dual-stack)').should('be.visible');

      // Confirms LKE-E Phase 2 VPC options do not display with the BYO VPC flag OFF.
      cy.findByText('Automatically generate a VPC for this cluster').should(
        'not.exist'
      );
      cy.findByText('Use an existing VPC').should('not.exist');

      cy.findByText('Dedicated CPU').should('be.visible').click();
      addNodes(mockPlan.formattedLabel);

      // Bypass ACL validation
      cy.get('input[name="acl-acknowledgement"]').check();

      // Confirm change is reflected in checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]').within(() => {
        cy.findByText(`${mockPlan.formattedLabel} Plan`).should('be.visible');
        cy.findByTitle(`Remove ${mockPlan.label} Node Pool`).should(
          'be.visible'
        );

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

    it('Simple Page Check - Phase 2 MTC Flags Both ON', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          postLa: false,
          phase2Mtc: { byoVPC: true, dualStack: true },
        },
      }).as('getFeatureFlags');

      cy.visitWithLogin('/kubernetes/create');
      cy.findByText('Add Node Pools').should('be.visible');

      cy.findByLabelText('Cluster Label').click();
      cy.focused().type(mockCluster.label);

      cy.findByText('LKE Enterprise').click();

      ui.regionSelect.find().click().type(`${mockRegion.label}`);
      ui.regionSelect.findItemByRegionId(mockRegion.id, [mockRegion]).click();

      cy.findByLabelText('Kubernetes Version').should('be.visible').click();
      cy.findByText(latestEnterpriseTierKubernetesVersion.id)
        .should('be.visible')
        .click();

      // Confirms LKE-E Phase 2 IP Stack and VPC options display with both flags ON.
      cy.findByText('IP Stack').should('be.visible');
      cy.findByText('IPv4', { exact: true }).should('be.visible');
      cy.findByText('IPv4 + IPv6 (dual-stack)').should('be.visible');
      cy.findByText('Automatically generate a VPC for this cluster').should(
        'be.visible'
      );
      cy.findByText('Use an existing VPC').should('be.visible');

      cy.findByText('Dedicated CPU').should('be.visible').click();
      addNodes(mockPlan.formattedLabel);

      // Bypass ACL validation
      cy.get('input[name="acl-acknowledgement"]').check();

      // Confirm change is reflected in checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]').within(() => {
        cy.findByText(`${mockPlan.formattedLabel} Plan`).should('be.visible');
        cy.findByTitle(`Remove ${mockPlan.label} Node Pool`).should(
          'be.visible'
        );

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

    it('Simple Page Check - Phase 2 MTC Flags Both OFF', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          postLa: false,
          phase2Mtc: { byoVPC: false, dualStack: false },
        },
      }).as('getFeatureFlags');

      cy.visitWithLogin('/kubernetes/create');
      cy.findByText('Add Node Pools').should('be.visible');

      cy.findByLabelText('Cluster Label').click();
      cy.focused().type(mockCluster.label);

      cy.findByText('LKE Enterprise').click();

      ui.regionSelect.find().click().type(`${mockRegion.label}`);
      ui.regionSelect.findItemByRegionId(mockRegion.id, [mockRegion]).click();

      cy.findByLabelText('Kubernetes Version').should('be.visible').click();
      cy.findByText(latestEnterpriseTierKubernetesVersion.id)
        .should('be.visible')
        .click();

      // Confirms LKE-E Phase 2 IP Stack and VPC options do not display with both flags OFF.
      cy.findByText('IP Stack').should('not.exist');
      cy.findByText('IPv4', { exact: true }).should('not.exist');
      cy.findByText('IPv4 + IPv6 (dual-stack)').should('not.exist');
      cy.findByText('Automatically generate a VPC for this cluster').should(
        'not.exist'
      );
      cy.findByText('Use an existing VPC').should('not.exist');

      cy.findByText('Dedicated CPU').should('be.visible').click();
      addNodes(mockPlan.formattedLabel);

      // Bypass ACL validation
      cy.get('input[name="acl-acknowledgement"]').check();

      // Confirm change is reflected in checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]').within(() => {
        cy.findByText(`${mockPlan.formattedLabel} Plan`).should('be.visible');
        cy.findByTitle(`Remove ${mockPlan.label} Node Pool`).should(
          'be.visible'
        );

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

  describe('Phase 2 MTC & Post-LA feature flags', () => {
    it('Simple Page Check - Phase 2 MTC Flags and Post-LA Flag ON', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          postLa: true,
          phase2Mtc: { byoVPC: true, dualStack: true },
        },
      });

      cy.visitWithLogin('/kubernetes/create');

      lkeClusterCreatePage.setLabel(randomLabel());
      lkeClusterCreatePage.selectClusterTier('enterprise');
      lkeClusterCreatePage.selectRegionById(mockRegion.id, [mockRegion]);
      lkeClusterCreatePage.selectPlanTab('Dedicated CPU');

      // Confirm that IP stack selection and VPC options are present.
      cy.findByText('IPv4')
        .should('be.visible')
        .closest('input')
        .should('be.enabled');

      cy.findByText('IPv4 + IPv6 (dual-stack)')
        .should('be.visible')
        .closest('input')
        .should('be.enabled');

      cy.findByText('Automatically generate a VPC for this cluster')
        .should('be.visible')
        .closest('input')
        .should('be.enabled');

      cy.findByText('Use an existing VPC')
        .should('be.visible')
        .closest('input')
        .should('be.enabled');

      // Confirm that node pools are configured via new drawer rather than directly within table.
      lkeClusterCreatePage.selectNodePoolPlan(mockPlan.formattedLabel);
      lkeClusterCreatePage.withinNodePoolDrawer(mockPlan.formattedLabel, () => {
        // Confirm that Enterprise-tier specific options are present.
        cy.findByText('Update Strategy').should('be.visible');
        cy.findByText('Use default firewall').should('be.visible');
        cy.findByText('Select existing firewall').should('be.visible');

        ui.button
          .findByTitle('Add Pool')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      lkeClusterCreatePage.withinOrderSummary(() => {
        cy.contains(mockPlan.formattedLabel)
          .closest('[data-testid="node-pool-summary"]')
          .within(() => {
            cy.findByText('3 Nodes').should('be.visible');
            cy.findByText('Edit Configuration').should('be.visible');
          });
      });
    });
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
    mockGetClusters([mockCluster]).as('getClusters');
    mockGetCluster(mockCluster).as('getCluster');
    mockGetClusterPools(mockCluster.id, mockNodePools).as('getNodePools');
    mockGetVPC(mockVPC).as('getVPC');
  });

  /*
   * Smoke tests to confirm the state of the LKE cluster details page when the
   * LKE-E "phase2Mtc" feature flag is enabled.
   */
  describe('Phase 2 MTC feature flag', () => {
    /*
     * - Confirms the state of the LKE cluster details page when the Phase 2 BYO VPC feature is enabled.
     * - Confirms that attached VPC label is displayed in the cluster summary.
     * - Confirms that VPC IP columns are not present when Phase 2 dual stack flag is disabled.
     */
    it('Simple Page Check - Phase 2 MTC BYO VPC Flag ON', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          phase2Mtc: { byoVPC: true, dualStack: false },
        },
      }).as('getFeatureFlags');

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

      // Confirm VPC IP columns are not present in the node table header
      cy.get('[aria-label="List of Your Cluster Nodes"] thead').within(() => {
        cy.contains('th', 'VPC IPv4').should('not.exist');
        cy.contains('th', 'VPC IPv6').should('not.exist');
      });
    });

    /*
     * - Confirms the state of the LKE cluster details page when the Phase 2 dual stack feature is enabled.
     * - Confirms that VPC node pool table IP columns are present.
     * - Confirms that attached VPC label is absent in the cluster summary when the BYO VPC feature is disabled.
     */
    it('Simple Page Check - Phase 2 MTC Dual Stack Flag ON', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          phase2Mtc: { byoVPC: false, dualStack: true },
        },
      }).as('getFeatureFlags');

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
      cy.wait(['@getCluster', '@getNodePools']);

      // Confirm linked VPC is not present
      cy.get('[data-qa-kube-entity-footer]').within(() => {
        cy.contains('VPC:').should('not.exist');
        cy.findByTestId('assigned-lke-cluster-label').should('not.exist');
      });

      // Confirm VPC IP columns are present in the node table header
      cy.get('[aria-label="List of Your Cluster Nodes"] thead').within(() => {
        cy.contains('th', 'VPC IPv4').should('be.visible');
        cy.contains('th', 'VPC IPv6').should('be.visible');
      });
    });

    /*
     * - Confirms the state of the LKE cluster details page when the Phase 2 dual stack and BYO VPC features are enabled.
     * - Confirms that VPC node pool table IP columns are present.
     * - Confirms that attached VPC label is displayed in the cluster summary.
     */
    it('Simple Page Check - Phase 2 MTC Flags Both ON', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          phase2Mtc: { byoVPC: true, dualStack: true },
        },
      }).as('getFeatureFlags');

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

    /*
     * - Confirms the state of the LKE cluster details page when the "phase2Mtc" feature is disabled.
     * - Confirms that no VPC label is shown in the cluster summary.
     * - Confirms that IPv4 and IPv6 node pool table columns are absent.
     */
    it('Simple Page Check - Phase 2 MTC Flags Both OFF', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          phase2Mtc: { byoVPC: false, dualStack: false },
        },
      }).as('getFeatureFlags');

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

  /*
   * Smoke tests to confirm the state of the LKE cluster details page when the
   * LKE-E "postLa" feature flag is enabled and disabled.
   */
  describe('Post-LA feature flags', () => {
    /*
     * - Confirms the state of the LKE cluster details page when the "postLa" feature flag is enabled.
     * - Confirms that update strategy and firewall options are present in the Add Node Pool drawer.
     */
    it('Simple Page Check - Post-LA Flag ON', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          postLa: true,
          phase2Mtc: { byoVPC: false, dualStack: false },
        },
      }).as('getFeatureFlags');

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
      ui.button
        .findByTitle('Add a Node Pool')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(`Add a Node Pool: ${mockCluster.label}`)
        .should('be.visible')
        .within(() => {
          cy.findByText('Update Strategy').scrollIntoView();
          cy.findByText('Update Strategy').should('be.visible');
          cy.findByText('Use default firewall').should('be.visible');
          cy.findByText('Select existing firewall').should('be.visible');
        });
    });

    /*
     * - Confirms the state of the LKE cluster details page when the "postLa" feature flag is disabled.
     * - Confirms that update strategy and firewall options are absent in the Add Node Pool drawer.
     */
    it('Simple Page Check - Post-LA Flag OFF', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          phase2Mtc: { byoVPC: false, dualStack: false },
          postLa: false,
        },
      }).as('getFeatureFlags');

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);
      ui.button
        .findByTitle('Add a Node Pool')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(`Add a Node Pool: ${mockCluster.label}`)
        .should('be.visible')
        .within(() => {
          cy.findByText('Update Strategy').should('not.exist');
          cy.findByText('Use default firewall').should('not.exist');
          cy.findByText('Select existing firewall').should('not.exist');
        });
    });
  });

  /*
   * Smoke tests to confirm the state of the LKE cluster details page when the
   * 'phase2Mtc' and 'postLa' LKE-E feature flags are both enabled.
   */
  describe('Phase 2 MTC & Post-LA feature flags', () => {
    /*
     * - Confirms the state of LKE details page when "phase2Mtc" and "postLa" are both enabled.
     * - Confirms that update strategy and Firewall options are present in Add Node Pool drawer.
     * - Confirms that attached VPC is shown in the summary, and IPv4 and IPv6 node pool table columns are present.
     */
    it('Simple Page Check - Phase 2 MTC Flags and Post-LA Flag ON', () => {
      mockAppendFeatureFlags({
        lkeEnterprise2: {
          enabled: true,
          la: true,
          phase2Mtc: { byoVPC: true, dualStack: true },
          postLa: true,
        },
      });

      cy.visitWithLogin(`/kubernetes/clusters/${mockCluster.id}/summary`);

      // Confirm that VPC label is shown in summary, and that IPv4 and IPv6
      // node pool table columns are present.
      cy.get('[data-qa-kube-entity-footer]').within(() => {
        cy.contains('VPC:').should('exist');
        cy.findByTestId('assigned-lke-cluster-label').should(
          'contain.text',
          mockVPC.label
        );
      });

      cy.findByLabelText('List of Your Cluster Nodes').within(() => {
        cy.contains('th', 'VPC IPv4').should('be.visible');
        cy.contains('th', 'VPC IPv6').should('be.visible');
      });

      ui.button
        .findByTitle('Add a Node Pool')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle(`Add a Node Pool: ${mockCluster.label}`)
        .should('be.visible')
        .within(() => {
          cy.findByText('Update Strategy').scrollIntoView();
          cy.findByText('Update Strategy').should('be.visible');
          cy.findByText('Use default firewall').should('be.visible');
          cy.findByText('Select existing firewall').should('be.visible');
        });
    });
  });
});
