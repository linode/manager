import { regionFactory } from '@linode/utilities';
import { mockGetAlertDefinition } from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import {
  interceptGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { getAlertsforRegion } from 'support/util/alerts';
import { randomString } from 'support/util/random';
// import { chooseRegion } from 'support/util/regions';

// import { accountFactory } from 'src/factories';

describe('Create flow when beta alerts enabled by region and feature flag', function () {
  beforeEach(() => {
    const mockEnabledRegion = regionFactory.build({
      capabilities: ['Linodes'],
      monitors: {
        alerts: ['Linodes'],
      },
    });
    const mockDisabledRegion = regionFactory.build({
      capabilities: ['Linodes'],
      monitors: {
        alerts: [],
      },
    });
    const mockRegions = [mockEnabledRegion, mockDisabledRegion];
    cy.wrap(mockRegions).as('mockRegions');
    mockGetRegions(mockRegions).as('getRegions');
    mockAppendFeatureFlags({
      aclpBetaServices: {
        alerts: true,
      },
    }).as('getFeatureFlags');
  });

  // UI displays beta Alerts,
  xit('Beta alerts become visible after switching to region w/ alerts enabled', function () {
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    const disabledRegion = this.mockRegions[1];
    interceptGetRegionAvailability(disabledRegion.id).as(
      'getRegionAvailability'
    );
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getRegions']);

    ui.regionSelect.find().click();
    ui.regionSelect.find().type(`${disabledRegion.label}{enter}`);
    cy.wait('@getRegionAvailability');
    // Alerts section is not visible until enabled region is selected
    cy.get('[data-qa-panel="Alerts"]').should('not.exist');
    ui.regionSelect.find().click();
    ui.regionSelect.find().clear();
    const enabledRegion = this.mockRegions[0];
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);
    cy.contains('Additional Options').should('be.visible');
    cy.get('[data-qa-panel="Alerts"]').should('be.visible');
  });

  xit('can toggle from legacy to beta alerts and back to legacy', function () {
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getRegions']);
    ui.regionSelect.find().click();
    const enabledRegion = this.mockRegions[0];
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);
    cy.get('[data-qa-panel="Alerts"]')
      .should('be.visible')
      .within(() => {
        ui.accordionHeading.findByTitle('Alerts');
        ui.accordionHeading
          .findByTitle('Alerts')
          .should('be.visible')
          .should('be.enabled')
          .click();
        ui.accordion.findByTitle('Alerts').within(() => {
          cy.get('[data-testid="notice-info"]')
            .should('be.visible')
            .within(() => {
              // TODO move strings to constants
              cy.contains(
                'Try the new Alerts (Beta) for more options, including customizable alerts. You can switch back to the current view at any time.'
              );
            });
          // legacy alert form
          // alert items are hardcoded in LinodeSettingsAlertsPanel.tsx
          cy.get('[data-qa-alerts-panel="true"]').each((panel) => {
            cy.wrap(panel).within(() => {
              // toggles are checked and enabled
              ui.toggle
                .find()
                .should('have.attr', 'data-qa-toggle', 'true')
                .should('be.visible')
                .should('be.enabled');
              // numeric inputs are disabled
              cy.get('[type="number"]')
                .should('be.visible')
                .should('be.disabled');
            });
          });

          // upgrade from legacy alerts to ACLP alerts
          ui.button
            .findByTitle('Try Alerts (Beta)')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });
      });
    cy.get('[data-qa-panel="Alerts"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-testid="betaChip"]').should('be.visible');
        // ui.accordion.findByTitle('Alerts').within(() => {
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(
              'Welcome to Alerts (Beta) with more options and greater flexibility.'
            );
          });
        // possible to downgrade from ACLP alerts to legacy alerts
        ui.button
          .findByTitle('Switch to legacy Alerts')
          .should('be.visible')
          .should('be.enabled');
        // });
      });
  });

  xit('legacy create flow', function () {
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getRegions']);
    ui.regionSelect.find().click();
    const enabledRegion = this.mockRegions[0];
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);
    // enter plan and password form fields to enable "View Code Snippets" button
    cy.get('[data-qa-tp="Linode Plan"]').scrollIntoView();
    cy.get('[data-qa-tp="Linode Plan"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-plan-row="Dedicated 8 GB"]').click();
      });
    cy.get('[type="password"]').should('be.visible').scrollIntoView();
    cy.get('[id="root-password"]').type(randomString(12));
    cy.scrollTo('bottom');
    ui.button
      .findByTitle('View Code Snippets')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.dialog
      .findByTitle('Create Linode')
      .should('be.visible')
      .within(() => {
        cy.get('pre code').should('be.visible');
        ui.button
          .findByTitle('Close')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.scrollTo('bottom');
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@createLinode').then((intercept) => {
      const alerts = intercept.request.body['alerts'];
      expect(alerts).to.eq(undefined);
    });
  });

  it('beta create flow', function () {
    mockGetUserPreferences({ isAclpAlertsBeta: true }).as('getUserPreferences');
    const { alertDetails } = getAlertsforRegion(this.mockRegions);
    mockGetAlertDefinition('linode', [alertDetails]).as('getAlertDefinitions');
    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getRegions']);
    ui.regionSelect.find().click();
    const enabledRegion = this.mockRegions[0];
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);
    cy.get('[data-qa-panel="Alerts"]')
      .should('be.visible')
      .within(() => {
        ui.accordionHeading.findByTitle('Alerts');
        ui.accordionHeading
          .findByTitle('Alerts')
          .should('be.visible')
          .should('be.enabled')
          .click();
        ui.accordion.findByTitle('Alerts').within(() => {
          cy.get('table[data-testid="alert-table"]')
            .should('be.visible')
            .find('tbody')
            .within(() => {
              cy.get('tr').should('have.length', 1);
              cy.get('tr')
                .first()
                .within(() => {
                  cy.get('td')
                    .eq(0)
                    .within(() => {
                      ui.toggle
                        .find()
                        .should('have.attr', 'data-qa-toggle', 'false')
                        .should('be.visible');
                    });
                  cy.get('td')
                    .eq(1)
                    .within(() => {
                      cy.findByText(alertDetails.label).should('be.visible');
                    });
                  cy.get('td')
                    .eq(2)
                    .within(() => {
                      const rule = alertDetails.rule_criteria.rules[0];
                      const str = `${rule.label} = ${rule.threshold} ${rule.unit}`;
                      cy.findByText(str).should('be.visible');
                    });
                  cy.get('td')
                    .eq(3)
                    .within(() => {
                      cy.findByText('User').should('be.visible');
                    });
                });
            });
        });
      });
    cy.wait(['@getAlertDefinitions']);
    // TODO: validate create modal
    // enter plan and password form fields to enable "View Code Snippets" button
    cy.get('[data-qa-tp="Linode Plan"]').scrollIntoView();
    cy.get('[data-qa-tp="Linode Plan"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-plan-row="Dedicated 8 GB"]').click();
      });
    cy.get('[type="password"]').should('be.visible').scrollIntoView();
    cy.get('[id="root-password"]').type(randomString(12));
    cy.scrollTo('bottom');
    ui.button
      .findByTitle('View Code Snippets')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.dialog
      .findByTitle('Create Linode')
      .should('be.visible')
      .within(() => {
        cy.get('pre code').should('be.visible');
        ui.button
          .findByTitle('Close')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.scrollTo('bottom');
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@createLinode').then((intercept) => {
      const alerts = intercept.request.body['alerts'];
      expect(alerts.system.length).to.equal(0);
      expect(alerts.user.length).to.equal(0);
    });
  });
});

describe('Create flow for region where alerts disabled', function () {
  this.beforeEach(() => {
    const mockDisabledRegion = regionFactory.build({
      capabilities: ['Linodes'],
      monitors: {
        alerts: [],
      },
    });
    const mockRegions = [mockDisabledRegion];
    cy.wrap(mockRegions).as('mockRegions');
    mockGetRegions(mockRegions).as('getRegions');
  });

  it('Create flow w/ no alerts', function () {
    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions']);
    ui.regionSelect.find().click();
    const disabledRegion = this.mockRegions[0];
    ui.regionSelect.find().type(`${disabledRegion.label}{enter}`);
    // enter plan and password form fields to enable "View Code Snippets" button
    cy.get('[data-qa-tp="Linode Plan"]').scrollIntoView();
    cy.get('[data-qa-tp="Linode Plan"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-plan-row="Dedicated 8 GB"]').click();
      });
    cy.get('[type="password"]').should('be.visible').scrollIntoView();
    cy.get('[id="root-password"]').type(randomString(12));
    cy.scrollTo('bottom');
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@createLinode').then((intercept) => {
      const alerts = intercept.request.body['alerts'];
      expect(alerts).to.eq(undefined);
    });
  });
});
