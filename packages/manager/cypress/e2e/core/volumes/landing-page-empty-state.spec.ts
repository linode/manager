import { ui } from 'support/ui';
import { mockGetVolumes } from 'support/intercepts/volumes';

describe('confirms Volumes landing page empty state is shown when no Volumes exist', () => {
  /*
   * - Confirms that Getting Started Guides is listed on landing page.
   * - Confirms that Video Playlist is listed on landing page.
   * - Confirms that clicking on Create Volume button navigates user to volume create page.
   */
  it('shows the empty state when no Volumes exist', () => {
    mockGetVolumes([]).as('getVolumes');

    cy.visitWithLogin('/volumes');
    cy.wait(['@getVolumes']);

    cy.findByText('NVMe block storage service').should('be.visible');
    cy.findByText('Getting Started Guides').should('be.visible');
    cy.findByText('Video Playlist').should('be.visible');

    // Create Volume button exists and clicking it navigates user to create volume page.
    ui.button
      .findByTitle('Create Volume')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/volumes/create');
  });
});
