import { mockGetFirewalls } from 'support/intercepts/firewalls';
import { ui } from 'support/ui';

describe('confirms Firewalls landing page empty state is shown when no Firewalls exist', () => {
  /*
   * - Confirms that Getting Started Guides is listed on landing page.
   * - Confirms that Video Playlist is listed on landing page.
   * - Confirms that clicking on Create Firewall button navigates user to firewall create page.
   */
  it('shows the empty state when no Firewalls exist', () => {
    mockGetFirewalls([]).as('getFirewalls');

    cy.visitWithLogin('/firewalls');
    cy.wait(['@getFirewalls']);

    cy.findByText('Secure cloud-based firewall').should('be.visible');
    cy.findByText(
      'Control network traffic to and from Linode Compute Instances with a simple management interface'
    ).should('be.visible');
    cy.findByText('Getting Started Guides').should('be.visible');
    cy.findByText('Video Playlist').should('be.visible');

    // Create Firewall button exists and clicking it navigates user to create firewall page.
    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/firewalls/create');
  });
});
