/**
 * @file LKE creation end-to-end tests.
 */
import {
  accountFactory,
  kubernetesClusterFactory,
  kubernetesControlPlaneACLFactory,
  kubernetesControlPlaneACLOptionsFactory,
  linodeTypeFactory,
  regionFactory,
} from 'src/factories';
import {
  mockCreateCluster,
  mockGetCluster,
  mockCreateClusterError,
  mockGetControlPlaneACL,
} from 'support/intercepts/lke';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetRegions,
  mockGetRegionAvailability,
} from 'support/intercepts/regions';
import { KubernetesCluster } from '@linode/api-v4';
import { LkePlanDescription } from 'support/api/lke';
import { lkeClusterPlans, lkeClusterPlansAPL } from 'support/constants/lke';
import { chooseRegion, getRegionById } from 'support/util/regions';
import { interceptCreateCluster } from 'support/intercepts/lke';
import { ui } from 'support/ui';
import { randomLabel, randomNumber, randomItem } from 'support/util/random';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';
import { mockGetAccountBeta } from 'support/intercepts/betas';
import {
  dcPricingLkeCheckoutSummaryPlaceholder,
  dcPricingLkeHAPlaceholder,
  dcPricingLkeClusterPlans,
  dcPricingMockLinodeTypes,
  dcPricingPlanPlaceholder,
  dcPricingDocsLabel,
  dcPricingDocsUrl,
} from 'support/constants/dc-specific-pricing';
import { mockGetLinodeTypes } from 'support/intercepts/linodes';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { accountBetaFactory } from 'src/factories';

/**
 * Gets the label for an LKE plan as shown in creation plan table.
 *
 * @param clusterPlan - Cluster plan from which to determine Cloud Manager LKE plan name.
 *
 * @returns LKE plan name for plan.
 */
const getLkePlanName = (clusterPlan: LkePlanDescription) => {
  return `${clusterPlan.type} ${clusterPlan.size} GB`;
};

/**
 * Gets the label for an LKE plan as shown in the creation checkout bar.
 *
 * @param clusterPlan - Cluster plan from which to determine Cloud Manager LKE checkout name.
 *
 * @returns LKE checkout plan name for plan.
 */
const getLkePlanCheckoutName = (clusterPlan: LkePlanDescription) => {
  return `${clusterPlan.type} ${clusterPlan.size} GB Plan`;
};

/**
 * Returns each plan in an array which is similar to the given plan.
 *
 * Plans are considered similar if they have identical type and size.
 *
 * @param clusterPlan - Cluster plan with which to compare similarity.
 * @param clusterPlans - Array from which to find similar cluster plans.
 *
 * @returns Array of similar cluster plans.
 */
const getSimilarPlans = (
  clusterPlan: LkePlanDescription,
  clusterPlans: LkePlanDescription[]
) => {
  return clusterPlans.filter((otherClusterPlan: any) => {
    return (
      clusterPlan.type === otherClusterPlan.type &&
      clusterPlan.size === otherClusterPlan.size
    );
  });
};

authenticate();
describe('LKE Cluster Creation', () => {
  before(() => {
    cleanUp(['linodes', 'lke-clusters']);
  });

  /*
   * - Confirms that users can create a cluster by completing the LKE create form.
   * - Confirms that LKE cluster is created.
   * - Confirms that user is redirected to new LKE cluster summary page.
   * - Confirms that new LKE cluster summary page shows expected node pools.
   * - Confirms that new LKE cluster is shown on LKE clusters landing page.
   * - Confirms that correct information is shown on the LKE cluster summary page
   */
  it('can create an LKE cluster', () => {
    cy.tag('method:e2e', 'purpose:dcTesting');
    const clusterLabel = randomLabel();
    const clusterRegion = chooseRegion({
      capabilities: ['Kubernetes'],
    });
    const clusterVersion = '1.27';
    const clusterPlans = new Array(2)
      .fill(null)
      .map(() => randomItem(lkeClusterPlans));

    interceptCreateCluster().as('createCluster');

    cy.visitWithLogin('/kubernetes/clusters');

    ui.button
      .findByTitle('Create Cluster')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/kubernetes/create');

    // Fill out LKE creation form label, region, and Kubernetes version fields.
    cy.findByLabelText('Cluster Label')
      .should('be.visible')
      .click()
      .type(`${clusterLabel}{enter}`);

    ui.regionSelect.find().click().type(`${clusterRegion.label}{enter}`);

    cy.findByText('Kubernetes Version')
      .should('be.visible')
      .click()
      .type(`${clusterVersion}{enter}`);

    cy.get('[data-testid="ha-radio-button-yes"]').should('be.visible').click();

    let totalCpu = 0;
    let totalMemory = 0;
    let totalStorage = 0;
    let monthPrice = 0;

    // Add a node pool for each randomly selected plan, and confirm that the
    // selected node pool plan is added to the checkout bar.
    clusterPlans.forEach((clusterPlan) => {
      const nodeCount = randomNumber(1, 3);
      const planName = getLkePlanName(clusterPlan);
      const checkoutName = getLkePlanCheckoutName(clusterPlan);

      cy.log(`Adding ${nodeCount}x ${getLkePlanName(clusterPlan)} node(s)`);
      // Click the right tab for the plan, and add a node pool with the desired
      // number of nodes.
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]')
            .should('be.visible')
            .click()
            .type(`{selectall}${nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that node pool is shown in the checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          // It's possible that multiple pools of the same type get added.
          // We're taking a naive approach here by confirming that at least one
          // instance of the pool appears in the checkout bar.
          cy.findAllByText(checkoutName).first().should('be.visible');
        });

      // Expected information on the LKE cluster summary page.
      if (clusterPlan.size == 2 && clusterPlan.type == 'Linode') {
        totalCpu = totalCpu + nodeCount * 1;
        totalMemory = totalMemory + nodeCount * 2;
        totalStorage = totalStorage + nodeCount * 50;
        monthPrice = monthPrice + nodeCount * 12;
      }
      if (clusterPlan.size == 4 && clusterPlan.type == 'Linode') {
        totalCpu = totalCpu + nodeCount * 2;
        totalMemory = totalMemory + nodeCount * 4;
        totalStorage = totalStorage + nodeCount * 80;
        monthPrice = monthPrice + nodeCount * 24;
      }
      if (clusterPlan.size == 4 && clusterPlan.type == 'Dedicated') {
        totalCpu = totalCpu + nodeCount * 2;
        totalMemory = totalMemory + nodeCount * 4;
        totalStorage = totalStorage + nodeCount * 80;
        monthPrice = monthPrice + nodeCount * 36;
      }
    });
    // $60.00/month for enabling HA control plane
    const totalPrice = monthPrice + 60;

    // Create LKE cluster.
    cy.get('[data-testid="kube-checkout-bar"]')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Create Cluster')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for LKE cluster to be created and confirm that we are redirected
    // to the cluster summary page.
    cy.wait('@createCluster').then(({ response }) => {
      if (!response) {
        throw new Error(
          `Error creating LKE cluster ${clusterLabel}; API request failed`
        );
      }
      const cluster: KubernetesCluster = response.body;
      cy.url().should('endWith', `/kubernetes/clusters/${cluster.id}/summary`);
    });

    // Confirm that each node pool is shown.
    clusterPlans.forEach((clusterPlan) => {
      // Because multiple node pools may have identical labels, we figure out
      // how many identical labels for each plan will exist and confirm that
      // the expected number is present.
      const nodePoolLabel = getLkePlanName(clusterPlan);
      const similarNodePoolCount = getSimilarPlans(clusterPlan, clusterPlans)
        .length;

      //Confirm that the cluster created with the expected parameters.
      cy.findAllByText(`${clusterRegion.label}`).should('be.visible');
      cy.findAllByText(`${totalCpu} CPU Cores`).should('be.visible');
      cy.findAllByText(`${totalMemory} GB RAM`).should('be.visible');
      cy.findAllByText(`${totalStorage} GB Storage`).should('be.visible');
      cy.findAllByText(`$${totalPrice}.00/month`).should('be.visible');
      cy.contains('Kubernetes API Endpoint').should('be.visible');
      cy.contains('linodelke.net:443').should('be.visible');

      cy.findAllByText(nodePoolLabel, { selector: 'h2' })
        .should('have.length', similarNodePoolCount)
        .first()
        .should('be.visible');
    });

    // Navigate to the LKE landing page and confirm that new cluster is shown.
    ui.breadcrumb
      .find()
      .should('be.visible')
      .within(() => {
        cy.findByText(clusterLabel).should('be.visible');

        cy.findByText('kubernetes').should('be.visible').click();
      });

    cy.url().should('endWith', '/kubernetes/clusters');
    cy.findByText(clusterLabel).should('be.visible');
  });
});

describe('LKE Cluster Creation with APL enabled', () => {
  before(() => {
    cleanUp('lke-clusters');
  });

  it('can create an LKE cluster with APL flag enabled', () => {
    mockAppendFeatureFlags({
      apl: true,
    }).as('getFeatureFlags');

    cy.tag('method:e2e', 'purpose:dcTesting');
    const clusterLabel = randomLabel();
    const clusterRegion = chooseRegion();
    const clusterVersion = '1.30';
    const clusterPLans = lkeClusterPlansAPL;
    const aplBeta = accountBetaFactory.build({
      id: 'apl',
      label: 'Application Platform for LKE',
      enrolled: '2024-10-29T15:16:58',
      description: null,
      started: '2024-10-01T04:00:00',
      ended: null,
    });

    interceptCreateCluster().as('createCluster');

    cy.visitWithLogin('/kubernetes/clusters');
    mockGetAccountBeta(aplBeta).as('getAccountBeta');
    cy.wait('@getFeatureFlags');

    ui.button
      .findByTitle('Create Cluster')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/kubernetes/create');
    cy.wait('@getAccountBeta');

    cy.findByLabelText('Cluster Label')
      .should('be.visible')
      .click()
      .type(`${clusterLabel}{enter}`);

    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId(clusterRegion.label).click();

    cy.findByText('Kubernetes Version')
      .should('be.visible')
      .click()
      .type(`${clusterVersion}{enter}`);

    // enable HA mode when APL is enabled and disable HA mode field
    cy.get('[data-testid="apl-radio-button-yes"]').should('be.visible').click();

    cy.get('[data-testid="ha-radio-button-yes"]')
      .find('input')
      .should('be.checked');

    cy.get('[data-testid="ha-radio-button-yes"]').should('be.disabled');

    /**
     * Adding predetermined list of nodepools.
     * It should not be posssible to add node pools under 8gb ram and/or 4 cores.
     * Only dedicated 8 should be selected
     */

    clusterPLans.forEach((clusterPlan) => {
      const planName = getLkePlanName(clusterPlan);
      const checkoutName = getLkePlanCheckoutName(clusterPlan);
      const planShouldBeDisabled = clusterPlan.disabled;

      cy.log(`attempting to add ${getLkePlanName(clusterPlan)} node`);

      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]')
            .should('be.visible')
            .should(planShouldBeDisabled ? 'be.disabled' : 'be.enabled');

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should(planShouldBeDisabled ? 'be.disabled' : 'be.enabled');

          if (!planShouldBeDisabled) {
            ui.button.findByTitle('Add').click();
          }
        });

      if (!planShouldBeDisabled) {
        cy.get('[data-testid="kube-checkout-bar"]')
          .should('be.visible')
          .within(() => {
            cy.findAllByText(checkoutName).first().should('be.visible');
          });
      }
    });

    // check for HA mode and Create LKE cluster in checkout bar.
    cy.get('[data-testid="kube-checkout-bar"]')
      .should('be.visible')
      .within(() => {
        cy.findByText('High Availability (HA) Control Plane').should(
          'be.visible'
        );

        ui.button
          .findByTitle('Create Cluster')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for LKE cluster to be created and confirm that we are redirected
    // to the cluster summary page.
    cy.wait('@createCluster').then(({ response }) => {
      if (!response) {
        throw new Error(
          `Error creating LKE cluster ${clusterLabel}; API request failed`
        );
      }
      const cluster: KubernetesCluster = response.body;
      cy.url().should('endWith', `/kubernetes/clusters/${cluster.id}/summary`);
    });
  });
});

describe('LKE Cluster Creation with DC-specific pricing', () => {
  before(() => {
    cleanUp('lke-clusters');
  });

  /*
   * - Confirms that DC-specific prices are present in the LKE create form.
   * - Confirms that pricing docs link is shown in "Region" section.
   * - Confirms that the plan table shows a message in place of plans when a region is not selected.
   * - Confirms that the cluster summary create button is disabled until a plan and region selection are made.
   * - Confirms that HA helper text updates dynamically to display pricing when a region is selected.
   */
  it('can dynamically update prices when creating an LKE cluster based on region', () => {
    const dcSpecificPricingRegion = getRegionById('us-east');
    const clusterLabel = randomLabel();
    const clusterVersion = '1.27';
    const clusterPlans = new Array(2)
      .fill(null)
      .map(() => randomItem(dcPricingLkeClusterPlans));

    cy.visitWithLogin('/kubernetes/clusters');

    ui.button
      .findByTitle('Create Cluster')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/kubernetes/create');

    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');
    cy.wait(['@getLinodeTypes']);

    // Confirm that, without a region selected, no pricing information is displayed.

    // Confirm checkout summary displays helper text and disabled create button.
    cy.findByText(dcPricingLkeCheckoutSummaryPlaceholder).should('be.visible');
    cy.get('[data-qa-deploy-linode]')
      .should('contain.text', 'Create Cluster')
      .should('be.disabled');

    // Confirm that plans table displays helper text instead of plans and prices.
    cy.contains(dcPricingPlanPlaceholder).should('be.visible');

    // Confirm that HA pricing displays helper text instead of price.
    cy.contains(dcPricingLkeHAPlaceholder).should('be.visible');

    // Confirm docs link to pricing page is visible.
    cy.findByText(dcPricingDocsLabel)
      .should('be.visible')
      .should('have.attr', 'href', dcPricingDocsUrl);

    // Fill out LKE creation form label, region, and Kubernetes version fields.
    cy.findByLabelText('Cluster Label')
      .should('be.visible')
      .click()
      .type(`${clusterLabel}{enter}`);

    ui.regionSelect.find().type(`${dcSpecificPricingRegion.label}{enter}`);

    // Confirm that HA price updates dynamically once region selection is made.
    cy.contains(/\$.*\/month/).should('be.visible');

    cy.get('[data-testid="ha-radio-button-yes"]').should('be.visible').click();

    cy.findByText('Kubernetes Version')
      .should('be.visible')
      .click()
      .type(`${clusterVersion}{enter}`);

    // Confirm that with region and HA selections, create button is still disabled until plan selection is made.
    cy.get('[data-qa-deploy-linode]')
      .should('contain.text', 'Create Cluster')
      .should('be.disabled');

    // Add a node pool for each randomly selected plan, and confirm that the
    // selected node pool plan is added to the checkout bar.
    clusterPlans.forEach((clusterPlan) => {
      const nodeCount = randomNumber(1, 3);
      const planName = getLkePlanName(clusterPlan);
      const checkoutName = getLkePlanCheckoutName(clusterPlan);

      cy.log(`Adding ${nodeCount}x ${getLkePlanName(clusterPlan)} node(s)`);
      // Click the right tab for the plan, and add a node pool with the desired
      // number of nodes.
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]')
            .should('be.visible')
            .click()
            .type(`{selectall}${nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that node pool is shown in the checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          // It's possible that multiple pools of the same type get added.
          // We're taking a naive approach here by confirming that at least one
          // instance of the pool appears in the checkout bar.
          cy.findAllByText(checkoutName).first().should('be.visible');
        });
    });

    // Confirm that create button is enabled.
    cy.get('[data-testid="kube-checkout-bar"]')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Create Cluster')
          .should('be.visible')
          .should('be.enabled');
      });
  });
});

describe('LKE Cluster Creation with ACL', () => {
  /**
   * - Confirms ACL flow does not exist if account doesn't have the corresponding capability
   */
  it('does not show the ACL flow without the LKE ACL capability', () => {
    mockGetAccount(
      accountFactory.build({
        capabilities: [],
      })
    ).as('getAccount');

    cy.visitWithLogin('/kubernetes/clusters');

    ui.button
      .findByTitle('Create Cluster')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/kubernetes/create');
    cy.wait(['@getAccount']);

    cy.contains('Control Plane ACL').should('not.exist');
  });

  // setting up mocks
  const clusterLabel = randomLabel();
  const mockRegion = regionFactory.build({
    capabilities: ['Linodes', 'Kubernetes'],
    id: 'us-east',
    label: 'Newark, US',
  });
  const mockLinodeTypes = [
    linodeTypeFactory.build({
      id: 'dedicated-1',
      label: 'dedicated-1',
      class: 'dedicated',
    }),
    linodeTypeFactory.build({
      id: 'dedicated-2',
      label: 'dedicated-2',
      class: 'dedicated',
    }),
  ];
  const clusterVersion = '1.31';
  const clusterPlan = { size: 2, tab: 'Dedicated CPU', type: 'Dedicated' };
  const nodeCount = 1;
  const planName = 'dedicated-1';
  const checkoutName = 'dedicated-1 Plan';

  describe('with LKE IPACL account capability', () => {
    beforeEach(() => {
      mockGetAccount(
        accountFactory.build({
          capabilities: [
            'LKE HA Control Planes',
            'LKE Network Access Control List (IP ACL)',
          ],
        })
      ).as('getAccount');
      mockGetRegions([mockRegion]).as('getRegions');
      mockGetLinodeTypes(mockLinodeTypes).as('getLinodeTypes');
      mockGetRegionAvailability(mockRegion.id, []).as('getRegionAvailability');
    });

    /**
     * - Confirms create flow when ACL is toggled off
     * - Confirms LKE summary page shows that ACL is not enabled
     */
    it('creates an LKE cluster with ACL disabled', () => {
      const mockACL = kubernetesControlPlaneACLFactory.build({
        acl: {
          enabled: false,
          'revision-id': '',
        },
      });
      const mockCluster = kubernetesClusterFactory.build({
        label: clusterLabel,
        region: mockRegion.id,
        k8s_version: clusterVersion,
        control_plane: mockACL,
      });
      mockCreateCluster(mockCluster).as('createCluster');
      mockGetCluster(mockCluster).as('getCluster');
      mockGetControlPlaneACL(mockCluster.id, mockACL).as('getControlPlaneACL');

      cy.visitWithLogin('/kubernetes/clusters');

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/kubernetes/create');
      cy.wait(['@getAccount', '@getRegions', '@getLinodeTypes']);

      // Fill out LKE creation form label, region, and Kubernetes version fields.
      cy.findByLabelText('Cluster Label')
        .should('be.visible')
        .click()
        .type(`${clusterLabel}{enter}`);

      ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);
      cy.wait(['@getRegionAvailability']);

      cy.findByText('Kubernetes Version')
        .should('be.visible')
        .click()
        .type(`${clusterVersion}{enter}`);

      cy.get('[data-testid="ha-radio-button-yes"]')
        .should('be.visible')
        .click();

      // Disable ACL
      cy.contains('Control Plane ACL').should('be.visible');
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'true')
        .should('be.visible')
        .click();

      // Add a node pool
      cy.log(`Adding ${nodeCount}x ${getLkePlanName(clusterPlan)} node(s)`);
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]')
            .should('be.visible')
            .click()
            .type(`{selectall}${nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that node pool is shown in the checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          cy.findAllByText(checkoutName).first().should('be.visible');
        });

      // create cluster
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@createCluster').then(() => {
        cy.url().should(
          'endWith',
          `/kubernetes/clusters/${mockCluster.id}/summary`
        );
      });

      cy.wait(['@getCluster', '@getControlPlaneACL']);

      // Confirms Summary panel displays as expected
      cy.contains('Control Plane ACL').should('be.visible');
      ui.button.findByTitle('Enable').should('be.visible').should('be.enabled');
    });

    /**
     * - Confirms create flow when ACL is toggled on
     * - Confirms adding IPs
     * - Confirms LKE summary page shows that ACL is enabled
     */
    it('creates an LKE cluster with ACL enabled', () => {
      const mockACLOptions = kubernetesControlPlaneACLOptionsFactory.build({
        'revision-id': '',
      });

      const mockACL = kubernetesControlPlaneACLFactory.build({
        acl: mockACLOptions,
      });

      const mockCluster = kubernetesClusterFactory.build({
        label: clusterLabel,
        region: mockRegion.id,
        k8s_version: clusterVersion,
        control_plane: mockACL,
      });
      mockCreateCluster(mockCluster).as('createCluster');
      mockGetCluster(mockCluster).as('getCluster');
      mockGetControlPlaneACL(mockCluster.id, mockACL).as('getControlPlaneACL');

      cy.visitWithLogin('/kubernetes/clusters');

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/kubernetes/create');
      cy.wait(['@getAccount']);

      // Fill out LKE creation form label, region, and Kubernetes version fields.
      cy.findByLabelText('Cluster Label')
        .should('be.visible')
        .click()
        .type(`${clusterLabel}{enter}`);

      ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);

      cy.findByText('Kubernetes Version')
        .should('be.visible')
        .click()
        .type(`${clusterVersion}{enter}`);

      cy.get('[data-testid="ha-radio-button-yes"]')
        .should('be.visible')
        .click();

      // Confirm ACL section
      cy.contains('Control Plane ACL').should('be.visible');
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'true')
        .should('be.visible');
      // Add some IPv4s and an IPv6
      cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click()
        .type('10.0.0.0/24');
      cy.findByText('Add IPv4 Address')
        .should('be.visible')
        .should('be.enabled')
        .click();
      cy.get('[id="domain-transfer-ip-1"]')
        .should('be.visible')
        .click()
        .type('10.0.1.0/24');
      cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click()
        .type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
      cy.findByText('Add IPv6 Address')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Add a node pool
      cy.log(`Adding ${nodeCount}x ${getLkePlanName(clusterPlan)} node(s)`);
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]')
            .should('be.visible')
            .click()
            .type(`{selectall}${nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that node pool is shown in the checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          cy.findAllByText(checkoutName).first().should('be.visible');
        });

      // create cluster
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@createCluster').then(() => {
        cy.url().should(
          'endWith',
          `/kubernetes/clusters/${mockCluster.id}/summary`
        );
      });

      cy.wait(['@getCluster', '@getControlPlaneACL']);

      // Confirms Summary panel displays as expected
      cy.contains('Control Plane ACL').should('be.visible');
      ui.button
        .findByTitle('Enabled (3 IP Addresses)')
        .should('be.visible')
        .should('be.enabled');
    });

    /**
     * - Confirms IP validation error appears when a bad IP is entered
     * - Confirms IP validation error disappears when a valid IP is entered
     * - Confirms API error appears as expected and doesn't crash the page
     */
    it('can handle validation and API errors', () => {
      const mockErrorMessage = 'Control Plane ACL error: request failed';
      mockCreateClusterError(mockErrorMessage, 400).as('createClusterError');

      cy.visitWithLogin('/kubernetes/clusters');

      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/kubernetes/create');
      cy.wait(['@getAccount']);

      // Fill out LKE creation form label, region, and Kubernetes version fields.
      cy.findByLabelText('Cluster Label')
        .should('be.visible')
        .click()
        .type(`${clusterLabel}{enter}`);

      ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);

      cy.findByText('Kubernetes Version')
        .should('be.visible')
        .click()
        .type(`${clusterVersion}{enter}`);

      cy.get('[data-testid="ha-radio-button-yes"]')
        .should('be.visible')
        .click();

      // Confirm ACL IPv4 validation works as expected
      cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click()
        .type('invalid ip');
      // click out of textbox and confirm error is visible
      cy.contains('Control Plane ACL').should('be.visible').click();
      cy.contains('Must be a valid IPv4 address.').should('be.visible');
      // enter valid IP
      cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click()
        .clear()
        .type('10.0.0.0/24');
      // Click out of textbox and confirm error is gone
      cy.contains('Control Plane ACL').should('be.visible').click();
      cy.contains('Must be a valid IPv4 address.').should('not.exist');

      // Confirm ACL IPv6 validation works as expected
      cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click()
        .type('invalid ip');
      // click out of textbox and confirm error is visible
      cy.contains('Control Plane ACL').should('be.visible').click();
      cy.contains('Must be a valid IPv6 address.').should('be.visible');
      // enter valid IP
      cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
        .should('be.visible')
        .click()
        .clear()
        .type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
      // Click out of textbox and confirm error is gone
      cy.contains('Control Plane ACL').should('be.visible').click();
      cy.contains('Must be a valid IPv6 address.').should('not.exist');

      // Add a node pool
      cy.log(`Adding ${nodeCount}x ${getLkePlanName(clusterPlan)} node(s)`);
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(planName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]')
            .should('be.visible')
            .click()
            .type(`{selectall}${nodeCount}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that node pool is shown in the checkout bar.
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          cy.findAllByText(checkoutName).first().should('be.visible');
        });

      // Attempt to create cluster
      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm API error displays
      cy.wait('@createClusterError');
      cy.contains(mockErrorMessage).should('be.visible');
    });
  });
});
