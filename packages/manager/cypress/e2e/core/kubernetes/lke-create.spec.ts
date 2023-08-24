/**
 * @file LKE creation end-to-end tests.
 */

import { KubernetesCluster } from '@linode/api-v4';
import { LkePlanDescription } from 'support/api/lke';
import { lkeClusterPlans } from 'support/constants/lke';
import { chooseRegion } from 'support/util/regions';
import { interceptCreateCluster } from 'support/intercepts/lke';
import { ui } from 'support/ui';
import { randomLabel, randomNumber, randomItem } from 'support/util/random';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';

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
    cleanUp('lke-clusters');
  });

  /*
   * - Confirms that users can create a cluster by completing the LKE create form.
   * - Confirms that LKE cluster is created.
   * - Confirms that user is redirected to new LKE cluster summary page.
   * - Confirms that new LKE cluster summary page shows expected node pools.
   * - Confirms that new LKE cluster is shown on LKE clusters landing page.
   */
  it('can create an LKE cluster', () => {
    const clusterLabel = randomLabel();
    const clusterRegion = chooseRegion();
    const clusterVersion = '1.26';
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

    cy.findByText('Region')
      .should('be.visible')
      .click()
      .type(`${clusterRegion.label}{enter}`);

    cy.findByText('Kubernetes Version')
      .should('be.visible')
      .click()
      .type(`${clusterVersion}{enter}`);

    cy.get('[data-testid="ha-radio-button-yes"]').should('be.visible').click();

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
