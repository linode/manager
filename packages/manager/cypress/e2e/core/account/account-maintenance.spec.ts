import { mockGetMaintenance } from 'support/intercepts/account';
import { accountMaintenanceFactory } from 'src/factories';

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
   * - Confirm "Download CSV" button for pending maintenance visible and enabled.
   * - Confirm "Download CSV" button for completed maintenance visible and enabled.
   */
  it('confirm maintenance details in the tables', () => {
    const pendingMaintenanceNumber = 2;
    const completedMaintenanceNumber = 5;
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

    // Confirm Pending table is not empty and contains exact number of pending maintenances
    cy.findByLabelText('List of pending maintenance')
      .should('be.visible')
      .find('tbody')
      .within(() => {
        accountpendingMaintenance.forEach(() => {
          cy.get('tr')
            .should('have.length', accountpendingMaintenance.length)
            .each((row, index) => {
              const pendingMaintenance = accountpendingMaintenance[index];
              cy.wrap(row).within(() => {
                cy.contains(pendingMaintenance.entity.label).should(
                  'be.visible'
                );
                // Confirm that the first 90 characters of each reason string are rendered on screen
                const truncatedReason = pendingMaintenance.reason.substring(
                  0,
                  90
                );
                cy.findByText(truncatedReason, { exact: false }).should(
                  'be.visible'
                );
                // Check the content of each <td> element
                cy.get('td').each(($cell, idx, $cells) => {
                  cy.wrap($cell).should('not.be.empty');
                });
              });
            });
        });
      });

    // Confirm Completed table is not empty and contains exact number of completed maintenances
    cy.findByLabelText('List of completed maintenance')
      .should('be.visible')
      .find('tbody')
      .within(() => {
        accountcompletedMaintenance.forEach(() => {
          cy.get('tr')
            .should('have.length', accountcompletedMaintenance.length)
            .each((row, index) => {
              const completedMaintenance = accountcompletedMaintenance[index];
              cy.wrap(row).within(() => {
                cy.contains(completedMaintenance.entity.label).should(
                  'be.visible'
                );
                // Confirm that the first 90 characters of each reason string are rendered on screen
                const truncatedReason = completedMaintenance.reason.substring(
                  0,
                  90
                );
                cy.findByText(truncatedReason, { exact: false }).should(
                  'be.visible'
                );
                // Check the content of each <td> element
                cy.get('td').each(($cell, idx, $cells) => {
                  cy.wrap($cell).should('not.be.empty');
                });
              });
            });
        });
      });

    // Confirm download buttons work
    cy.get('button')
      .filter(':contains("Download CSV")')
      .should('be.visible')
      .should('be.enabled')
      .click({ multiple: true });
    // TODO Need to add assertions to confirm CSV contains the expected contents on first trial (M3-8393)
  });
});
