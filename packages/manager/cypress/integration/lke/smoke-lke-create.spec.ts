import { makeTestLabel } from '../../support/api/common';
import {
  containsClick,
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible
} from '../../support/helpers';
import { selectRegionString } from '../../support/ui/constants';

const multipleClick = (
  subject: Cypress.Chainable,
  n: number
): Cypress.Chainable => {
  if (n == 1) {
    return subject.click();
  }
  return multipleClick(subject.click(), n - 1);
};

const addNodes = (plan: string, nb: number) => {
  const extraNb = Math.ceil(Math.random() * 5);
  cy.get(`[data-qa-plan-row="${plan}"`).within(_card => {
    multipleClick(cy.get('[data-testid="increment-button"]'), extraNb + nb);
    multipleClick(cy.get('[data-testid="decrement-button"]'), extraNb);

    cy.get('[data-testid="textfield-input"]')
      .invoke('val')
      .should('eq', `${nb}`);
    fbtClick('Add');
  });
};

describe('LKE Create Cluster', () => {
  it('Simple Page Check', () => {
    const lkeId = Math.ceil(Math.random() * 9999);
    cy.intercept('POST', '*/lke/clusters', { id: lkeId }).as('createCluster');
    cy.visitWithLogin('/kubernetes/create');
    fbtVisible('Add Node Pools');
    cy.contains('Cluster Label')
      .next()
      .children()
      .click()
      .type(makeTestLabel());
    containsClick(selectRegionString).type('Newar{enter}');
    cy.contains('Kubernetes Version')
      .next()
      .children()
      .click()
      .type('1.17{enter}');

    const kNb2Gb = 2;
    addNodes('Linode 2GB', kNb2Gb);

    // wait for change to reflect on Checkout bar

    fbtVisible('Linode 2GB Plan');
    cy.get('[data-testid="kube-checkout-bar"]').within(_bar => {
      fbtVisible('Linode 2GB Plan');
      getVisible('[data-testid="remove-pool-button"]');
      cy.get('[data-qa-notice="true"]').within(_notice => {
        fbtVisible(
          'We recommend at least 3 nodes in each pool. Fewer nodes may affect availability.'
        );
      });
    });
    fbtClick('Create Cluster');
    cy.wait('@createCluster');
    cy.url().should('endWith', `/kubernetes/clusters/${lkeId}/summary`);
  });
});
