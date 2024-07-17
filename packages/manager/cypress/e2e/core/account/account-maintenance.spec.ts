import { mockGetMaintenance } from 'support/intercepts/account';
import { accountMaintenanceFactory } from 'src/factories';

describe('Maintenance', () => {
  /*
   * - Confirm user can navigate to account maintenance page via user menu.
   * - When there is no pending maintenance, "No pending maintenance." is shown in the table.
   * - When there is no completed maintenance, "No completed maintenance." is shown in the table.
   */
  it('table empty when no maintenance', () => {
    mockGetMaintenance([]).as('getMaintenance');

    cy.visitWithLogin('/linodes');
    // user can navigate to account maintenance page via user menu.
    cy.findByTestId('nav-group-profile').click();
    cy.findByTestId('menu-item-Maintenance')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.url().should('endWith', '/account/maintenance');

    cy.wait('@getMaintenance');

    // Confirm correct messages shown in the table when no maintenance.
    cy.contains('No pending maintenance').should('be.visible');
    cy.contains('No completed maintenance').should('be.visible');
  });

  /*
   * - Uses mock API data to confirm pending maintenance.
   * - When there is pending maintenance, it is shown in the table with expected details.
   */
  it.only('pending maintenance visible in the table with expected details', () => {
    const accountpendingMaintenance = accountMaintenanceFactory.buildList(5);
    const accountcompletedMaintenance = accountMaintenanceFactory.buildList(
      10,
      { status: 'completed' }
    );

    mockGetMaintenance(accountpendingMaintenance).as('getPendingMaintenance');
    mockGetMaintenance(accountcompletedMaintenance).as(
      'getCompleteMaintenance'
    );

    cy.visitWithLogin('/account/maintenance');

    cy.wait('@getPendingMaintenance');
    cy.wait('@getCompleteMaintenance');
  });
});
