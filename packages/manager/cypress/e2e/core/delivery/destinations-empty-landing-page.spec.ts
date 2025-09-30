import {
  mockGetDestinations,
  setLocalStorageLogsFlag,
} from 'support/intercepts/delivery';
import { ui } from 'support/ui';

describe('Destinations empty landing page', () => {
  beforeEach(() => {
    setLocalStorageLogsFlag();
  });

  /**
   * - Confirms Destinations landing page empty state is shown when no Destinations are present:
   * - Confirms that clicking "Create Destination" navigates user to create destination page.
   */
  it('shows the empty state when there are no destinations', () => {
    mockGetDestinations([]).as('getDestinations');

    cy.visitWithLogin('/logs/delivery/destinations');
    cy.wait(['@getDestinations']);

    // Confirm empty Destinations Landing Text
    cy.findByText('Create a destination for cloud logs').should('be.visible');

    // confirms clicking on 'Create Domain' button
    ui.button
      .findByTitle('Create Destination')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/logs/delivery/destinations/create');
  });
});
