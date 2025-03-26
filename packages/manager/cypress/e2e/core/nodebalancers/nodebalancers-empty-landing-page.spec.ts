import { ui } from 'support/ui';
import { mockGetNodeBalancers } from 'support/intercepts/nodebalancers';

describe('NodeBalancers empty landing page', () => {
  /**
   * - Confirms NodeBalancers landing page empty state is shown when no NodeBalancers are present:
   * - Confirms that "Getting Started Guides" and "Video Playlist" are listed on landing page.
   * - Confirms that clicking "Create NodeBalancers" navigates user to NodeBalancer create page.
   */
  it('shows the empty state when there are no nodebalancers', () => {
    mockGetNodeBalancers([]).as('getNodebalancers');

    cy.visitWithLogin('/nodebalancers');
    cy.wait(['@getNodebalancers']);

    // confirms helper text
    cy.findByText('Cloud-based load balancing service').should('be.visible');
    cy.findByText(
      'Add high availability and horizontal scaling to web applications hosted on Linode Compute Instances.'
    ).should('be.visible');

    // checks that guides are visible
    cy.findByText('Getting Started Guides').should('be.visible');
    cy.findByText('Getting Started with NodeBalancers').should('be.visible');
    cy.findByText('Create a NodeBalancer').should('be.visible');
    cy.findByText('Configuration Options for NodeBalancers').should(
      'be.visible'
    );
    cy.findByText('View additional NodeBalancer documentation').should(
      'be.visible'
    );

    // checks that videos are visible
    cy.findByText('Video Playlist').should('be.visible');
    cy.findByText(
      'Getting Started With NodeBalancers | How To Prepare For High Server Traffic'
    ).should('be.visible');
    cy.findByText(
      'Linode NodeBalancers Explained | Manage Scale with Transparent Load Distribution'
    ).should('be.visible');
    cy.findByText('Load Balancing on an LKE Kubernetes Cluster').should(
      'be.visible'
    );
    cy.findByText('View our YouTube channel').should('be.visible');

    // confirms clicking on 'Create NodeBalancer' button
    ui.button
      .findByTitle('Create NodeBalancer')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/nodebalancers/create');
  });
});
