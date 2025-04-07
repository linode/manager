/**
 * @file Linode Create view code snippets tests.
 */

import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

describe('Create Linode flow to validate code snippet modal', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: false },
    });
  });
  /*
   * tests for create Linode flow to validate code snippet modal.
   */

  it(`view code snippets in create linode flow`, () => {
    const linodeLabel = randomLabel();
    const rootPass = randomString(32);
    const mockLinodeRegion = chooseRegion({
      capabilities: ['Linodes'],
    });
    cy.visitWithLogin('/linodes/create');

    // Set Linode label, distribution, plan type, password, etc.
    linodeCreatePage.setLabel(linodeLabel);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(mockLinodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(rootPass);

    // View Code Snippets and confirm it's provisioned as expected.
    ui.button
      .findByTitle('View Code Snippets')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle('Create Linode')
      .should('be.visible')
      .within(() => {
        ui.tabList
          .findTabByTitle('cURL')
          .should('be.visible')
          .should('be.enabled');

        ui.tabList.findTabByTitle('Linode CLI').should('be.visible').click();

        // Validate Integrations
        ui.tabList.findTabByTitle('Integrations').should('be.visible').click();

        // Validate Ansible and links
        ui.autocomplete.find().click();

        ui.autocompletePopper
          .findByTitle('Ansible')
          .should('be.visible')
          .click();
        cy.contains(
          'a',
          'Getting Started With Ansible: Basic Installation and Setup'
        ).should('be.visible');
        cy.contains('a', 'Linode Cloud Instance Module').should('be.visible');
        cy.contains('a', 'Manage Personal Access Tokens').should('be.visible');
        cy.contains('a', 'Best Practices For Ansible').should('be.visible');
        cy.contains(
          'a',
          'Use the Linode Ansible Collection to Deploy a Linode'
        ).should('be.visible');

        // Validate Terraform and links
        ui.autocomplete.find().click();
        ui.autocompletePopper
          .findByTitle('Terraform')
          .should('be.visible')
          .click();
        cy.contains('a', `A Beginner's Guide to Terraform`).should(
          'be.visible'
        );
        cy.contains('a', 'Install Terraform').should('be.visible');
        cy.contains('a', 'Manage Personal Access Tokens').should('be.visible');
        cy.contains('a', 'Use Terraform With Linode Object Storage').should(
          'be.visible'
        );
        cy.contains(
          'a',
          'Use Terraform to Provision Infrastructure on Linode'
        ).should('be.visible');
        cy.contains('a', 'Import Existing Infrastructure to Terraform').should(
          'be.visible'
        );

        // Validate SDKs tab
        ui.tabList.findTabByTitle(`SDKs`).should('be.visible').click();

        ui.autocomplete.find().click();

        // Validate linodego and links
        ui.autocompletePopper
          .findByTitle('Go (linodego)')
          .should('be.visible')
          .click();
        cy.contains('a', 'Go client for Linode REST v4 API').should(
          'be.visible'
        );
        cy.contains('a', 'Linodego Documentation').should('be.visible');

        ui.autocomplete.find().click();

        // Validate Python API4 and links
        ui.autocompletePopper
          .findByTitle('Python (linode_api4-python)')
          .should('be.visible')
          .click();

        cy.contains(
          'a',
          'Official python library for the Linode APIv4 in python'
        ).should('be.visible');
        cy.contains('a', 'linode_api4-python Documentation').should(
          'be.visible'
        );

        ui.button
          .findByTitle('Close')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
  });
});
