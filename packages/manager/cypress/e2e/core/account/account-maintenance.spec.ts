import { mockGetMaintenance } from 'support/intercepts/account';
import { accountMaintenanceFactory } from 'src/factories';
//import { ui } from 'support/ui';

describe('Maintenance', () => {
  /*
   * - Confirm user can navigate to account maintenance page via user menu.
   * - When there is no pending maintenance, "No pending maintenance." is shown in the table.
   * - When there is no completed maintenance, "No completed maintenance." is shown in the table.
   */
  it('table empty when no maintenance', () => {
    mockGetMaintenance([], []).as('getMaintenance');

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
   * - Uses mock API data to confirm maintenance details.
   * - When there is pending maintenance, it is shown in the table with expected details.
   * - When there is completed maintenance, it is shown in the table with expected details.
   */
  it.only('confirm maintenance details in the tables', () => {
    const pendingMaintenanceNumber = 5;
    const completedMaintenanceNumber = 10;
    const accountpendingMaintenance = accountMaintenanceFactory.buildList(
      pendingMaintenanceNumber
    );
    const accountcompletedMaintenance = accountMaintenanceFactory.buildList(
      completedMaintenanceNumber,
      { status: 'completed' }
    );

    mockGetMaintenance(
      accountpendingMaintenance,
      accountcompletedMaintenance
    ).as('getMaintenance');

    cy.visitWithLogin('/account/maintenance');

    cy.wait('@getMaintenance');

    cy.contains('No pending maintenance').should('not.exist');
    cy.contains('No completed maintenance').should('not.exist');
    /*

    // Confirm Pending table is not empty and contains exact number of pending maintenances
    // Confirm Completed table is not empty and contains exact number of completed maintenances
    cy.get('tbody.MuiTableBody-root.css-apqrd9-MuiTableBody-root').each(($tbody, index, $tbodys) => {
      cy.wrap($tbody).within(() => {
        if (index === 0) {
          cy.get('tr').should('have.length', pendingMaintenanceNumber)
        } else if (index === $tbodys.length - 1) {
          cy.get('tr').should('have.length', completedMaintenanceNumber)
        };
        cy.get('tr').should('exist')
          .each(($row, idx, $rows) => {           
            cy.wrap($row).within(() => {
              // Check the content of each <td> element
              cy.get('td').each(($cell, idx, $cells) => {
                cy.wrap($cell).should('not.be.empty');
              });
            });
          });;
      });
    });

    */

    cy.contains('button', 'Download CSV')
      .should('be.visible')
      .should('be.enabled')
      .click({ multiple: true });
  });
});
