import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';

describe('NodeBalancer create page validation', () => {
  /**
   * This test ensures that the user sees a uniqueness error when
   * - they configure many TCP, HTTP, or HTTPS configs to use the same port
   * - they configure many UDP configs to use the same port
   */
  it('renders a port uniqueness errors when you try to create a nodebalancer with configs using the same port and protocol', () => {
    mockAppendFeatureFlags({
      udp: true,
    });
    cy.visitWithLogin('/nodebalancers/create');

    // Configure the first config to use TCP on port 8080
    cy.get('[id=port-0]').clear();
    cy.get('[id=port-0]').type('8080');

    cy.get('[id=protocol-0]').click();
    cy.findByRole('option', { name: 'TCP' }).click();

    // Add a HTTP config using port 8080
    cy.findByRole('button', { name: 'Add another Configuration' }).click();

    cy.get('[id=port-1]').clear();
    cy.get('[id=port-1]').type('8080');

    cy.get('[id=protocol-1]').click();
    cy.findByRole('option', { name: 'HTTP' }).click();

    // Add a HTTPS config using port 8080
    cy.findByRole('button', { name: 'Add another Configuration' }).click();

    cy.get('[id=port-2]').clear();
    cy.get('[id=port-2]').type('8080');

    cy.get('[id=protocol-2]').click();
    cy.findByRole('option', { name: 'HTTPS' }).click();

    // Add a UDP config using port 5123
    cy.findByRole('button', { name: 'Add another Configuration' }).click();

    cy.get('[id=port-3]').clear();
    cy.get('[id=port-3]').type('5123');

    cy.get('[id=protocol-3]').click();
    cy.findByRole('option', { name: 'UDP' }).click();

    // Add another UDP config using port 5123
    cy.findByRole('button', { name: 'Add another Configuration' }).click();

    cy.get('[id=port-4]').clear();
    cy.get('[id=port-4]').type('5123');

    cy.get('[id=protocol-4]').click();
    cy.findByRole('option', { name: 'UDP' }).click();

    // Add a UDP config using port 22
    cy.findByRole('button', { name: 'Add another Configuration' }).click();

    cy.get('[id=port-5]').clear();
    cy.get('[id=port-5]').type('22');

    cy.get('[id=protocol-5]').click();
    cy.findByRole('option', { name: 'UDP' }).click();

    cy.findByRole('button', { name: 'Create NodeBalancer' })
      .should('be.enabled')
      .click();

    // We expect 3 of these errors because we configured
    // - A config using TCP on port 8080
    // - A config using HTTP on port 8080
    // - A config using HTTPS on port 8080
    cy.findAllByText(
      'Port must be unique amongst TCP / HTTP / HTTPS configurations.'
    ).should('have.length', 3);

    // We expect 2 of these errors because we configured two UDP configs
    // using port 5123.
    cy.findAllByText('Port must be unique amongst UDP configurations.').should(
      'have.length',
      2
    );
  });
});
