import {
  containsClick,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from 'support/helpers';
import { selectRegionString } from 'support/ui/constants';
import { randomLabel } from 'support/util/random';

const multipleClick = (
  subject: Cypress.Chainable,
  n: number
): Cypress.Chainable => {
  if (n == 1) {
    return subject.click();
  }
  return multipleClick(subject.click(), n - 1);
};

const addNodes = (plan: string) => {
  const defaultNodes = 3;
  const extraNodes = Math.ceil(Math.random() * 5);
  cy.get(`[data-qa-plan-row="${plan}"`).within((_card) => {
    multipleClick(cy.get('[data-testid="increment-button"]'), extraNodes);
    multipleClick(cy.get('[data-testid="decrement-button"]'), extraNodes + 1);

    cy.get('[data-testid="textfield-input"]')
      .invoke('val')
      .should('eq', `${defaultNodes - 1}`);
    fbtClick('Add');
  });
};

describe('LKE Create Cluster', () => {
  it('Simple Page Check', () => {
    const lkeId = Math.ceil(Math.random() * 9999);
    // intercept request to stub response
    cy.intercept('POST', '*/lke/clusters', {
      id: lkeId,
    }).as('createCluster');
    cy.visitWithLogin('/kubernetes/create');
    fbtVisible('Add Node Pools');
    cy.contains('Cluster Label').next().children().click().type(randomLabel());
    containsClick(selectRegionString).type('Newar{enter}');
    cy.get('[id="kubernetes-version"]').type('{enter}');
    fbtClick('Shared CPU');
    addNodes('Linode 2 GB');

    // wait for change to reflect on Checkout bar

    fbtVisible('Linode 2 GB Plan');
    cy.get('[data-testid="kube-checkout-bar"]').within((_bar) => {
      fbtVisible('Linode 2 GB Plan');
      getVisible('[data-testid="remove-pool-button"]');
      cy.get('[data-qa-notice="true"]').within((_notice) => {
        fbtVisible(
          'We recommend a minimum of 3 nodes in each Node Pool to avoid downtime during upgrades and maintenance.'
        );
      });
    });
    getClick('[data-qa-deploy-linode="true"]');
    cy.wait('@createCluster');
    cy.url().should('endWith', `/kubernetes/clusters/${lkeId}/summary`);
  });
});
