import { makeTestLabel } from '../../support/api/common';

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
    cy.findByLabelText('Region')
      .click()
      .clear()
      .type('Newar{enter}');
    cy.findByLabelText('Kubernetes Version')
      .click()
      .clear()
      .type('1.17{enter}');
    cy.get('[data-qa-plan-row="Linode 2GB"').within(_card => {
      cy.get('[data-testid="increment-button"]')
        .click()
        .click()
        .click()
        .click();
      cy.get('[data-testid="decrement-button"]')
        .click()
        .click();

      cy.findByRole('textbox')
        .invoke('val')
        .should('be', '2');
      cy.findByText('Add').click();
    });
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
