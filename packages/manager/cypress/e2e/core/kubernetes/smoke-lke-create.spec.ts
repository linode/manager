import { kubernetesClusterFactory } from '@src/factories';
import { randomLabel, randomNumber } from 'support/util/random';
import { mockCreateCluster } from 'support/intercepts/lke';
import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';

/**
 * Performs a click operation on Cypress subject a given number of times.
 *
 * @param subject - Cypress subject to click.
 * @param count - Number of times to perform click.
 *
 * @returns Cypress chainable.
 */
const multipleClick = (
  subject: Cypress.Chainable,
  count: number
): Cypress.Chainable => {
  if (count == 1) {
    return subject.click();
  }
  return multipleClick(subject.click(), count - 1);
};

/**
 * Adds a random-sized node pool of the given plan.
 *
 * @param plan Name of plan for which to add nodes.
 */
const addNodes = (plan: string) => {
  const defaultNodes = 3;
  const extraNodes = randomNumber(1, 5);

  cy.get(`[data-qa-plan-row="${plan}"`).within(() => {
    multipleClick(cy.get('[data-testid="increment-button"]'), extraNodes);
    multipleClick(cy.get('[data-testid="decrement-button"]'), extraNodes + 1);

    cy.get('[data-testid="textfield-input"]')
      .invoke('val')
      .should('eq', `${defaultNodes - 1}`);

    ui.button
      .findByTitle('Add')
      .should('be.visible')
      .should('be.enabled')
      .click();
  });
};

// Warning that's shown when recommended minimum number of nodes is not met.
const minimumNodeNotice =
  'We recommend a minimum of 3 nodes in each Node Pool to avoid downtime during upgrades and maintenance.';

describe('LKE Create Cluster', () => {
  it('Simple Page Check', () => {
    const mockCluster = kubernetesClusterFactory.build({
      label: randomLabel(),
      id: randomNumber(10000, 99999),
    });
    mockCreateCluster(mockCluster).as('createCluster');
    cy.visitWithLogin('/kubernetes/create');
    cy.findByText('Add Node Pools').should('be.visible');

    cy.findByLabelText('Cluster Label').click();
    cy.focused().type(mockCluster.label);

    ui.regionSelect.find().click().type(`${chooseRegion().label}{enter}`);

    cy.findByText('Kubernetes Version').should('be.visible').click();
    cy.focused().type('{enter}');

    cy.get('[data-testid="ha-radio-button-yes"]').should('be.visible').click();

    cy.findByText('Shared CPU').should('be.visible').click();
    addNodes('Linode 2 GB');

    // Confirm change is reflected in checkout bar.
    cy.get('[data-testid="kube-checkout-bar"]').within(() => {
      cy.findByText('Linode 2 GB Plan').should('be.visible');
      cy.findByTitle('Remove Linode 2GB Node Pool').should('be.visible');

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
