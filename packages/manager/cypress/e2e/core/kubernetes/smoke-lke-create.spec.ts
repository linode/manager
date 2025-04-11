import { profileFactory } from '@linode/utilities';
import {
  accountUserFactory,
  grantsFactory,
  kubernetesClusterFactory,
} from '@src/factories';
import { mockGetUser } from 'support/intercepts/account';
import { mockCreateCluster } from 'support/intercepts/lke';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';
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
      id: randomNumber(10000, 99999),
      label: randomLabel(),
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

  it('should not allow creating cluster for restricted users', () => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
    // simulating a default user without the ability to add Linodes.
    const mockProfile = profileFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      restricted: true,
      user_type: 'default',
      username: mockProfile.username,
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_kubernetes: false,
      },
    });

    const mockCluster = kubernetesClusterFactory.build({
      id: randomNumber(10000, 99999),
      label: randomLabel(),
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);
    mockCreateCluster(mockCluster).as('createCluster');

    cy.visitWithLogin('/kubernetes/create');
    cy.findByText('Add Node Pools').should('be.visible');

    // Confirm that a notice should be shown informing the user they do not have permission to create a Cluster.
    cy.findByText(
      "You don't have permissions to create LKE Clusters. Please contact your account administrator to request the necessary permissions."
    ).should('be.visible');

    // Confirm that "Cluster Label" field is disabled.
    cy.findByLabelText('Cluster Label')
      .should('be.visible')
      .should('be.disabled');

    // Confirm that "Region" field is disabled.
    ui.regionSelect.find().should('be.visible').should('be.disabled');

    // Confirm that "Kubernetes Version" field is disabled.
    cy.get('[data-qa-autocomplete="Kubernetes Version"] input')
      .should('be.visible')
      .should('be.disabled');

    // Confirm that "HA" field is disabled.
    cy.get('[data-testid="ha-radio-button-yes"]').should('be.visible').click();
    cy.get('[data-testid="ha-radio-button-yes"]').should('not.be.checked');

    cy.get('[data-testid="kube-checkout-bar"]').within(() => {
      // Confirm that "Create Cluster" field is disabled.
      ui.button
        .findByTitle('Create Cluster')
        .should('be.visible')
        .should('be.disabled');
    });
  });
});
