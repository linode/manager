import { regionFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
// import { linodeFactory } from '@linode/utilities';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
// import { mockGetLinodeStats } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
// import { randomLabel, randomNumber } from 'support/util/random';
import { mockGetRegions } from 'support/intercepts/regions';
// import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';

import { accountFactory } from 'src/factories';
// import { serviceTypesFactory } from 'src/factories';

describe('Create flow when beta alerts enabled by region and feature flag', function () {
  this.beforeEach(() => {
    // const mockAccount = accountFactory.build();
    // mockGetRegions([chooseRegion()]).as('getRegions');
    // mockGetAccount(mockAccount);
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
  // UI displays beta Alerts, can switch to legacy view
  it(' "Additional Options" section appears when enabled region is selected', function () {
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getRegions']);

    ui.regionSelect.find().click();
    // ui.regionSelect.find().clear();
    const disabledRegion = this.mockRegions[1];
    ui.regionSelect.find().type(`${disabledRegion.label}{enter}`);
    // Alerts section is not visible until enabled region is selected
    // cy.scrollTo('bottom')
    cy.get('[data-qa-panel="Alerts"]').should('not.exist');
    ui.regionSelect.find().click();
    ui.regionSelect.find().clear();
    const enabledRegion = this.mockRegions[0];
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);
    cy.contains('Additional Options').should('be.visible');
  });

  it('can toggle from legacy to beta alerts', function () {
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getRegions']);
    ui.regionSelect.find().click();
    // ui.regionSelect.find().clear();
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
              cy.contains(
                'Try the new Alerts (Beta) for more options, including customizable alerts. You can switch back to the current view at any time.'
              );
            });
          // legacy alert components are visible
          cy.get('[data-qa-alert="CPU Usage"]').should('be.visible');
          // can upgrade from legacy alerts to ACLP alerts
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
        ui.accordion.findByTitle('Alerts').within(() => {
          cy.get('[data-testid="notice-info"]')
            .should('be.visible')
            .within(() => {
              cy.contains(
                'Welcome to Alerts (Beta) with more options and greater flexibility.'
              );
            });
          // can downgrade from ACLP alerts to legacy alerts
          ui.button
            .findByTitle('Switch to legacy Alerts')
            .should('be.visible')
            .should('be.enabled');
        });
      });
    // TODO: validate create modal
  });

  xit('user preference for legacy alerts', function () {
    mockAppendFeatureFlags({
      aclpBetaServices: {
        alerts: true,
      },
    }).as('getFeatureFlags');
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.visitWithLogin('/linodes/create');
  });
});

xdescribe('ACLP alerts in Linode create flow for region where alerts disabled', function () {
  this.beforeEach(() => {
    const mockAccount = accountFactory.build();
    mockGetRegions([chooseRegion()]).as('getRegions');
    mockGetAccount(mockAccount);
  });
  // UI displays beta Alerts, can switch to legacy view
  it(' "Additional Options" section is present when the feature flag is enabled', function () {
    mockAppendFeatureFlags({
      aclpBetaServices: {
        alerts: true,
      },
    }).as('getFeatureFlags');
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
    mockGetRegions([mockEnabledRegion, mockDisabledRegion]).as('getRegions');
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.visitWithLogin('/linodes/create');
    cy.wait([
      '@getFeatureFlags',
      // '@getUserPreferences',
      '@getRegions',
      // '@getLinode',
      // '@getCloudPulseService',
      // '@getDashboardError',
    ]);

    ui.regionSelect.find().click();
    // ui.regionSelect.find().clear();
    ui.regionSelect.find().type(`${mockDisabledRegion.label}{enter}`);
    // Alerts section is not visible until enabled region is selected
    // cy.scrollTo('bottom')
    cy.get('[data-qa-panel="Alerts"]').should('not.exist');

    ui.regionSelect.find().click();
    ui.regionSelect.find().clear();
    ui.regionSelect.find().type(`${mockEnabledRegion.label}{enter}`);

    cy.contains('Additional Options').should('be.visible');
    // cy.get('[data-qa-panel="Alerts"]').scrollIntoView();
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
              cy.contains(
                'Try the new Alerts (Beta) for more options, including customizable alerts. You can switch back to the current view at any time.'
              );
            });
          // can upgrade from legacy alerts to ACLP alerts
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
        ui.accordion.findByTitle('Alerts').within(() => {
          cy.get('[data-testid="notice-info"]')
            .should('be.visible')
            .within(() => {
              cy.contains(
                'Welcome to Alerts ,(Beta) with more options and greater flexibility.'
              );
            });
          // can downgrade from ACLP alerts to legacy alerts
          ui.button
            .findByTitle('Switch to legacy Alerts')
            .should('be.visible')
            .should('be.enabled');
        });
      });
  });

  it('user preference for beta alerts', function () {
    // mockAppendFeatureFlags({
    //   aclpIntegration: true,
    // }).as('getFeatureFlags');
    mockGetUserPreferences({ isAclpAlertsBeta: true }).as('getUserPreferences');
    cy.visitWithLogin('/linodes/create');
  });

  xit('user preference for legacy alerts', function () {
    // mockAppendFeatureFlags({
    //   aclpIntegration: true,
    // }).as('getFeatureFlags');
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.visitWithLogin('/linodes/create');
  });

  xit('alerts are not present if aclpIntegration is disabled', function () {
    // mockAppendFeatureFlags({
    //   aclpIntegration: false,
    // }).as('getFeatureFlags');
    cy.visitWithLogin('/linodes/create');
  });
  // TODO: how can region disable alerts? if alerts enabled, can see Alerts before region selected
});
