/**
 * @file LKE creation end-to-end tests.
 */

import { ui } from 'support/ui';
import { regionsFriendly } from 'support/constants/regions';
import { randomLabel, randomNumber, randomItem } from 'support/util/random';

const availableClusterPlans = [
  {
    name: 'Dedicated 4 GB',
    count: randomNumber(3, 10),
    tab: 'Dedicated CPU',
  },
  {
    name: 'Dedicated 16 GB',
    count: randomNumber(3, 10),
    tab: 'Dedicated CPU',
  },
  {
    name: 'Linode 2 GB',
    count: randomNumber(3, 10),
    tab: 'Shared CPU',
  },
  {
    name: 'Linode 4 GB',
    count: randomNumber(3, 10),
    tab: 'Shared CPU',
  },
  {
    name: 'Linode 16 GB',
    count: randomNumber(3, 10),
    tab: 'Shared CPU',
  },
  {
    name: 'Linode 24 GB',
    count: randomNumber(3, 6),
    tab: 'High Memory',
  },
];

describe('LKE Cluster Creation', () => {
  it('can create an LKE cluster', () => {
    const clusterLabel = randomLabel();
    const clusterRegion = randomItem(regionsFriendly);
    const clusterVersion = randomItem(['1.24', '1.25']);
    const clusterPlans = new Array(randomNumber(2, 4))
      .fill(null)
      .map(() => randomItem(availableClusterPlans));

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
      cy.log(
        `Adding ${clusterPlan.count}x ${clusterPlan.name} ${clusterPlan.tab} node(s)`
      );
      cy.findByText(clusterPlan.tab).should('be.visible').click();
      cy.findByText(clusterPlan.name)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[name="Quantity"]')
            .should('be.visible')
            .click()
            .type(`{selectall}${clusterPlan.count}`);

          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });
    });
  });
});
