import { regionFactory } from '@linode/utilities';
import { mockGetAccountSettings } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomString } from 'support/util/random';

import { accountSettingsFactory } from 'src/factories';

describe('vmHostMaintenance feature flag', function () {
  beforeEach(() => {
    mockGetAccountSettings(
      accountSettingsFactory.build({
        maintenance_policy: 'linode/power_off_on',
      })
    ).as('getAccountSettings');
    const mockEnabledRegion = regionFactory.build({
      capabilities: ['Linodes', 'Maintenance Policy'],
    });
    const mockDisabledRegion = regionFactory.build({
      capabilities: ['Linodes'],
    });
    const mockRegions = [mockEnabledRegion, mockDisabledRegion];
    cy.wrap(mockRegions).as('mockRegions');
    mockGetRegions(mockRegions).as('getRegions');
  });

  it('Create flow when vmHostMaintenance feature flag is enabled', function () {
    const enabledRegion = this.mockRegions[0];
    const disabledRegion = this.mockRegions[1];
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: true,
      },
    }).as('getFeatureFlags');

    interceptCreateLinode().as('createLinode');

    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getAccountSettings', '@getFeatureFlags', '@getRegions']);

    // "Host Maintenance Policy" section is present under the "Additional Options"
    cy.contains('Additional Options').should('be.visible');
    cy.get('[data-qa-panel="Host Maintenance Policy"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-panel-summary="Host Maintenance Policy"]').click();
      });
    cy.get('[data-qa-autocomplete="Maintenance Policy"]')
      .should('be.visible')
      .within(() => {
        cy.get('input[data-testid="textfield-input"]')
          .should('be.visible')
          .should('be.disabled');
        cy.findByText('Select a region to choose a maintenance policy.').should(
          'be.visible'
        );
        ui.tooltip
          .findByText("You don't have permission to change this setting.")
          .should('be.visible');
      });

    // user selects region that does not have the "Maintenance Policy" capability
    ui.regionSelect.find().click();
    ui.regionSelect.find().type(`${disabledRegion.label}{enter}`);
    cy.get('[data-qa-autocomplete="Maintenance Policy"]')
      .should('be.visible')
      .within(() => {
        cy.get('input[data-testid="textfield-input"]')
          .should('be.visible')
          .should('be.disabled');
        cy.findByText(
          'Maintenance policy is not available in the selected region.'
        ).should('be.visible');
      });

    // user selects region that does have the "Maintenance Policy" capability
    ui.regionSelect.find().click();
    ui.regionSelect.find().clear();
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);
    cy.get('[data-qa-autocomplete="Maintenance Policy"]')
      .should('be.visible')
      .within(() => {
        cy.get('input[data-testid="textfield-input"]')
          .should('be.visible')
          .should('be.enabled');
      });

    // form prerequisites
    cy.get('[type="password"]').should('be.visible').scrollIntoView();
    cy.get('[id="root-password"]').type(randomString(12));
    cy.get('table[aria-label="List of Linode Plans"] tbody tr')
      .first()
      .within(() => {
        cy.get('td')
          .first()
          .within(() => {
            cy.get('input').should('be.enabled').click();
          });
      });

    cy.scrollTo('bottom');
    ui.button
      .findByTitle('View Code Snippets')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // maintenance policy is included in the code snippets
    ui.dialog
      .findByTitle('Create Linode')
      .should('be.visible')
      .within(() => {
        cy.get('pre code')
          .should('be.visible')
          .within(() => {
            cy.contains('--maintenance_policy linode/migrate');
          });
        // cURL tab
        ui.tabList.findTabByTitle('cURL').should('be.visible').click();
        cy.get('pre code')
          .should('be.visible')
          .within(() => {
            cy.contains('"maintenance_policy": "linode/migrate"');
          });
        ui.button
          .findByTitle('Close')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // submit
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    // POST payload should include maintenance_policy
    cy.wait('@createLinode').then((intercept) => {
      expect(intercept.request.body['maintenance_policy']).to.eq(
        'linode/migrate'
      );
    });
  });

  it('Create flow when vmHostMaintenance feature flag is disabled', function () {
    const enabledRegion = this.mockRegions[0];
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: false,
      },
    }).as('getFeatureFlags');
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getAccountSettings', '@getFeatureFlags', '@getRegions']);

    ui.regionSelect.find().click();
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);

    // "Host Maintenance Policy" section is not present
    cy.get('[data-qa-panel="Host Maintenance Policy"]').should('not.exist');
  });
});
