/**
 * @file Page utilities for Linode Create page (v2 implementation).
 */

import { ui } from 'support/ui';

/**
 * Page utilities for interacting with the Linode create page.
 */
export const linodeCreatePage = {
  /**
   * Checks the Linode's backups.
   */
  checkBackups: () => {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    cy.get('[data-testid="backups"]').should('be.visible').click();
  },

  /**
   * Checks the EU agreements.
   */
  checkEUAgreements: () => {
    cy.get('body').then(($body) => {
      if ($body.find('div[data-testid="eu-agreement-checkbox"]').length > 0) {
        // eslint-disable-next-line cypress/unsafe-to-chain-command
        cy.findAllByText('EU Standard Contractual Clauses', {
          exact: false,
        }).should('be.visible');
        // eslint-disable-next-line cypress/unsafe-to-chain-command
        cy.get('[data-testid="eu-agreement-checkbox"]')
          .within(() => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get('[id="gdpr-checkbox"]').click();
          })
          .click();
      }
    });
  },

  /**
   * Checks the Linode's private IPs.
   */
  checkPrivateIPs: () => {
    cy.findByText('Private IP').should('be.visible').closest('label').click();
  },

  /**
   * Selects the Image with the given name.
   *
   * @param imageName - Name of Image to select.
   */
  selectImage: (imageName: string) => {
    cy.findByText('Choose an OS')
      .closest('[data-qa-paper]')
      .within(() => {
        ui.autocomplete.find().click();

        ui.autocompletePopper
          .findByTitle(imageName)
          .should('be.visible')
          .click();
      });
  },

  /**
   * Select the given Linode plan.
   *
   * Assumes that plans are displayed in a table.
   *
   * @param planTabTitle - Title of tab where desired plan is located.
   * @param planTitle - Title of desired plan.
   */
  selectPlan: (planTabTitle: string, planTitle: string) => {
    cy.get('[data-qa-tp="Linode Plan"]').within(() => {
      ui.tabList.findTabByTitle(planTabTitle).click();
      cy.get(`[data-qa-plan-row="${planTitle}"]`)
        .closest('tr')
        .should('be.visible')
        .click();
    });
  },

  /**
   * Select the given Linode plan selection card.
   *
   * Useful for testing Linode create page against mobile viewports.
   *
   * Assumes that plans are displayed as selection cards.
   */
  selectPlanCard: (planTabTitle: string, planTitle: string) => {
    cy.get('[data-qa-tp="Linode Plan"]').within(() => {
      ui.tabList.findTabByTitle(planTabTitle).click();
      cy.findByText(planTitle)
        .should('be.visible')
        .as('selectionCard')
        .scrollIntoView();

      cy.get('@selectionCard').click();
    });
  },

  /**
   * Select the Region with the given ID.
   *
   * @param regionId - ID of Region to select.
   */
  selectRegionById: (regionId: string) => {
    ui.regionSelect.find().click().type(`${regionId}{enter}`);
  },

  /**
   * Sets the Linode's label.
   *
   * @param linodeLabel - Linode label to set.
   */
  setLabel: (linodeLabel: string) => {
    cy.findByLabelText('Linode Label').type(`{selectall}{del}${linodeLabel}`);
  },

  /**
   * Sets the Linode's root password.
   *
   * @param linodePassword - Root password to set.
   */
  setRootPassword: (linodePassword: string) => {
    cy.findByLabelText('Root Password').as('rootPasswordField').click();

    cy.get('@rootPasswordField').type(linodePassword, { log: false });
  },
};
