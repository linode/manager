import { makeTestLabel } from '../../support/api/common';

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
    cy.findByText('Add').click();
  });
};

describe('LKE Create Cluster', () => {
  it('Simple Page Check', () => {
    const lkeId = Math.ceil(Math.random() * 9999);
    cy.server();
    cy.route({
      method: 'POST',
      url: '*/lke/clusters',
      response: { id: lkeId }
    }).as('createCluster');
    cy.visitWithLogin('/kubernetes/create');
    cy.findByText('Add Node Pools');
    cy.findByLabelText('Cluster Label')
      .click()
      .clear()
      .type(makeTestLabel());
    cy.contains('Select a Region')
      .click()
      // .clear()
      .type('Newar{enter}');
    cy.findByLabelText('Kubernetes Version')
      .click()
      .clear()
      .type('1.17{enter}');

    const kNb2Gb = 2;
    addNodes('Linode 2GB', kNb2Gb);

    // wait for change to reflect on Checkout bar

    cy.findByText('Linode 2GB Plan');
    cy.get('[data-testid="kube-checkout-bar"]').within(_bar => {
      cy.findByText('Linode 2GB Plan');
      cy.get('[data-testid="remove-pool-button"]');
      cy.get('[data-qa-notice="true"]').within(_notice => {
        cy.findByText(
          'We recommend at least 3 nodes in each pool. Fewer nodes may affect availability.'
        ).should('be.visible');
      });
    });
    cy.findByText('Create Cluster').click();
    cy.wait('@createCluster');
    cy.url().should('endWith', `/kubernetes/clusters/${lkeId}/summary`);
  });
});
