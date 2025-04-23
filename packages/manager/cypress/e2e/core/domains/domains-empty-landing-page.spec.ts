import { mockGetDomains } from 'support/intercepts/domains';
import { ui } from 'support/ui';

describe('Domains empty landing page', () => {
  /**
   * - Confirms Domains landing page empty state is shown when no Domains are present:
   * - Confirms that "Getting Started Guides" and "Video Playlist" are listed on landing page.
   * - Confirms that clicking on "Import A Zone" opens "Import a Zone" drawer.
   * - Confirms that clicking "Create Domain" navigates user to domain create page.
   */
  it('shows the empty state when there are no domains', () => {
    mockGetDomains([]).as('getDomains');

    cy.visitWithLogin('/domains');
    cy.wait(['@getDomains']);

    // confirms helper text
    cy.findByText('Easy domain management').should('be.visible');
    cy.findByText(
      'A comprehensive, reliable, and fast DNS service that provides easy domain management for no additional cost.'
    ).should('be.visible');

    // checks that guides are visible
    cy.findByText('Getting Started Guides').should('be.visible');
    cy.findByText('Overview of DNS Manager').should('be.visible');
    cy.findByText('Getting Started with DNS Manager').should('be.visible');
    cy.findByText('Create a Domain Zone').should('be.visible');
    cy.findByText('View additional DNS Manager guides').should('be.visible');

    // checks that videos are visible
    cy.findByText('Video Playlist').should('be.visible');
    cy.findByText(
      'Linode DNS Manager | Total Control Over Your DNS Records'
    ).should('be.visible');
    cy.findByText(
      'Using Domains with Your Server | Common DNS Configurations'
    ).should('be.visible');
    cy.findByText('Connect a Domain to a Linode Server').should('be.visible');
    cy.findByText('View our YouTube channel').should('be.visible');

    // confirms Import a Zone drawer
    ui.button
      .findByTitle('Import a Zone')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.drawer
      .findByTitle('Import a Zone')
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Import')
          .should('be.visible')
          .should('be.disabled');

        cy.findByText('Remote Nameserver').should('be.visible');
        ui.buttonGroup
          .findButtonByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.findByText('Remote Nameserver').should('not.exist');

    // confirms clicking on 'Create Domain' button
    ui.button
      .findByTitle('Create Domain')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/domains/create');
  });
});
