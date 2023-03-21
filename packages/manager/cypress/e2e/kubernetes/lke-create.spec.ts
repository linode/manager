/**
 * @file LKE creation end-to-end tests.
 */

import { KubernetesCluster } from '@linode/api-v4/types';
import { ui } from 'support/ui';
import { lkeClusterPlans } from 'support/constants/lke';
import { regionsFriendly } from 'support/constants/regions';
import { interceptCreateCluster } from 'support/intercepts/lke';
import { randomLabel, randomNumber, randomItem } from 'support/util/random';

describe('LKE Cluster Creation', () => {
  it('can create an LKE cluster', () => {
    const clusterLabel = randomLabel();
    const clusterRegion = randomItem(regionsFriendly);
    const clusterVersion = '1.25';
    const clusterPlans = new Array(3)
      .fill(null)
      .map(() => randomItem(lkeClusterPlans));

    interceptCreateCluster().as('createCluster');
    cy.visitWithLogin('/kubernetes/create');

    cy.findByLabelText('Cluster Label')
      .should('be.visible')
      .click()
      .type(`${clusterLabel}{enter}`);

    cy.findByText('Region')
      .should('be.visible')
      .click()
      .type(`${clusterRegion}{enter}`);

    cy.findByLabelText('Kubernetes Version')
      .should('be.visible')
      .click()
      .type(`${clusterVersion}{enter}`);

    clusterPlans.forEach((clusterPlan) => {
      const nodeCount = randomNumber(3, 8);
      const planName = `${clusterPlan.type} ${clusterPlan.size} GB`;
      const checkoutName = `${clusterPlan.type} ${clusterPlan.size}GB Plan`;

      cy.log(`Adding ${nodeCount}x ${planName} ${clusterPlan.tab} node(s)`);
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

      cy.get('[data-testid="kube-checkout-bar"]')
        .should('be.visible')
        .within(() => {
          // It's possible that multiple clusters of the same type get added.
          // We're taking a naive approach here by confirming that at least one
          // instance of the cluster appears in the checkout bar.
          cy.findAllByText(checkoutName).first().should('be.visible');
        });
    });

    cy.get('[data-testid="kube-checkout-bar"]')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Create Cluster')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@createCluster').then(({ response }) => {
      if (!response) {
        throw new Error(
          `Error creating LKE cluster ${clusterLabel}; API request failed`
        );
      }
      const cluster: KubernetesCluster = response.body;
      cy.url().should('endWith', `/kubernetes/clusters/${cluster.id}/summary`);
      cy.findByText(clusterLabel);
      // Confirm that each Node pool is created.
      clusterPlans.forEach((clusterPlan) => {
        const nodePoolLabel = `${clusterPlan.type} ${clusterPlan.size}GB`;
        const similarNodePoolCount = clusterPlans.filter((otherClusterPlan) => {
          const otherNodePoolLabel = `${otherClusterPlan.type} ${otherClusterPlan.size}GB`;
          return nodePoolLabel === otherNodePoolLabel;
        }).length;

        cy.findAllByText(nodePoolLabel, { selector: 'h2' })
          .should('have.length', similarNodePoolCount)
          .first()
          .should('be.visible');
      });
    });
  });
});
