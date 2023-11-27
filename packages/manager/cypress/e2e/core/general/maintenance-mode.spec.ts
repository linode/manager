/**
 * @file Integration tests for Cloud Manager maintenance mode handling.
 */

import { mockApiMaintenanceMode } from 'support/intercepts/general';

describe('API maintenance mode', () => {
  /*
   * - Confirms that maintenance mode screen is shown when API responds with maintenance mode header.
   */
  it('shows maintenance screen when API is in maintenance mode', () => {
    mockApiMaintenanceMode();
    cy.visitWithLogin('/linodes');

    // Confirm that maintenance message and link to status page are shown.
    cy.findByText('We are undergoing maintenance.').should('be.visible');
    cy.contains('status.linode.com').should('be.visible');
  });
});
