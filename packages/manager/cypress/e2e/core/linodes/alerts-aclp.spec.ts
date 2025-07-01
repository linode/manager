import { regionAvailabilityFactory, regionFactory } from '@linode/utilities';
import { mockGetAlertDefinition } from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import {
  mockGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';

import { alertFactory } from 'src/factories';

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
        linode: {
          alerts: true,
          metrics: false,
        },
      },
    }).as('getFeatureFlags');
  });

  it('Beta alerts become visible after switching to region w/ alerts enabled', function () {
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    const disabledRegion = this.mockRegions[1];
    mockGetRegionAvailability(disabledRegion.id, []).as(
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

    // Alerts section is visible after enabled region is selected
    cy.contains('Additional Options').should('be.visible');
    cy.get('[data-qa-panel="Alerts"]').should('be.visible');
  });

  it('can toggle from legacy to beta alerts and back to legacy', function () {
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getRegions']);
    ui.regionSelect.find().click();
    const enabledRegion = this.mockRegions[0];
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);

    // legacy alerts are visible
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
            'Try the Alerts (Beta), featuring new options like customizable alerts. You can switch back to legacy Alerts at any time.'
          );
        });
    });
    // legacy alert form
    // alert items are hardcoded in LinodeSettingsAlertsPanel.tsx
    cy.get('[data-qa-alerts-panel="true"]').each((panel) => {
      cy.wrap(panel).within(() => {
        ui.toggle
          .find()
          .should('have.attr', 'data-qa-toggle', 'true')
          .should('be.visible')
          // TODO: do these need to be enabled in order to be added to POST or snippets modal?
          .should('be.disabled');
        // numeric inputs are disabled
        cy.get('[type="number"]').should('be.visible').should('be.disabled');
      });
    });

    // upgrade from legacy alerts to ACLP alerts
    ui.button
      .findByTitle('Try Alerts (Beta)')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.get('[data-qa-panel="Alerts"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-testid="betaChip"]').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(
              'Welcome to Alerts (Beta), designed for flexibility with features like customizable alerts.'
            );
          });
        // possible to downgrade from ACLP alerts to legacy alerts
        ui.button
          .findByTitle('Switch to legacy Alerts')
          .should('be.visible')
          .should('be.enabled');
      });
  });

  it('legacy create flow', function () {
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
        // 'alert' is not present anywhere in snippet
        cy.contains('alert').should('not.exist');
        // cURL tab
        ui.tabList.findTabByTitle('cURL').should('be.visible').click();
        cy.contains('alert').should('not.exist');
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
    const alertDefinitions = [
      alertFactory.build({
        description: randomLabel(),
        entity_ids: ['1', '2', '3'],
        label: randomLabel(),
        service_type: 'linode',
        severity: 1,
        status: 'enabled',
        type: 'system',
      }),
      alertFactory.build({
        description: randomLabel(),
        entity_ids: ['1', '2', '3'],
        label: randomLabel(),
        service_type: 'linode',
        severity: 1,
        status: 'enabled',
        type: 'system',
      }),
      alertFactory.build({
        description: randomLabel(),
        entity_ids: ['1', '2', '3'],
        label: randomLabel(),
        service_type: 'linode',
        severity: 1,
        status: 'enabled',
        type: 'user',
      }),
    ];
    mockGetAlertDefinition('linode', alertDefinitions).as(
      'getAlertDefinitions'
    );
    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getRegions']);
    ui.regionSelect.find().click();
    const enabledRegion = this.mockRegions[0];
    mockGetRegionAvailability(enabledRegion.id, []).as('getRegionAvailability');
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);

    // alerts panel appears
    cy.wait('@getRegionAvailability');
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
            .get('tbody > tr')
            .should('have.length', 3)
            .each((row, index) => {
              // match alert definitions to table cell contents
              cy.wrap(row).within(() => {
                cy.get('td')
                  .eq(0)
                  .within(() => {
                    // select each alert
                    ui.toggle
                      .find()
                      .should('have.attr', 'data-qa-toggle', 'false')
                      .should('be.visible')
                      .should('be.enabled')
                      .click();

                    ui.toggle
                      .find()
                      .should('have.attr', 'data-qa-toggle', 'true');
                  });
                cy.get('td')
                  .eq(1)
                  .within(() => {
                    cy.findByText(alertDefinitions[index].label).should(
                      'be.visible'
                    );
                  });
                cy.get('td')
                  .eq(2)
                  .within(() => {
                    const rule = alertDefinitions[index].rule_criteria.rules[0];
                    const str = `${rule.label} = ${rule.threshold} ${rule.unit}`;
                    cy.findByText(str).should('be.visible');
                  });
                cy.get('td')
                  .eq(3)
                  .within(() => {
                    cy.findByText(alertDefinitions[index].type, {
                      exact: false,
                    }).should('be.visible');
                  });
              });
            });
        });
      });
    cy.wait(['@getAlertDefinitions']);
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
        /** alert in code snippet
         * "alerts": {
         *    "system": [
         *             1,
         *             2,
         *      ],
         *      "user": [
         *             2
         *      ]
         * }
         */
        const strAlertSnippet = `alerts '{"system": [${alertDefinitions[0].id},${alertDefinitions[1].id}],"user":[${alertDefinitions[2].id}]}`;
        cy.contains(strAlertSnippet).should('be.visible');
        // cURL tab
        ui.tabList.findTabByTitle('cURL').should('be.visible').click();
        // hard to consolidate text within multiple spans in <pre><code>
        cy.get('pre code').within(() => {
          cy.contains('alerts');
          cy.contains('system');
          cy.contains('user');
        });
        ui.button
          .findByTitle('Close')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.scrollTo('bottom');

    // summary displays number of alerts ("+3")
    cy.get('[data-qa-linode-create-summary="true"]')
      .should('be.visible')
      .within(() => {
        cy.contains(`+${alertDefinitions.length}`);
      });
    // window scrolls to top, RegionSelect displays error msg
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@createLinode').then((intercept) => {
      const alerts = intercept.request.body['alerts'];
      expect(alerts.system.length).to.equal(2);
      expect(alerts.system[0]).to.eq(alertDefinitions[0].id);
      expect(alerts.system[1]).to.eq(alertDefinitions[1].id);
      expect(alerts.user.length).to.equal(1);
      expect(alerts.user[0]).to.eq(alertDefinitions[2].id);
    });
  });

  it('Creation fails for region where alerts disabled', function () {
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    const createLinodeErrorMsg = 'region is not valid';
    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions', '@getUserPreferences']);
    ui.regionSelect.find().click();
    const disabledRegion = this.mockRegions[1];

    const mockRegionAvailability = [
      regionAvailabilityFactory.build({
        available: true,
        region: disabledRegion.id,
      }),
    ];
    mockGetRegionAvailability(disabledRegion.id, mockRegionAvailability).as(
      'getRegionAvailability'
    );
    ui.regionSelect.find().type(`${disabledRegion.label}{enter}`);

    cy.wait('@getRegionAvailability');
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
      const body = intercept.response?.body;
      const alerts = body['alerts'];
      expect(alerts).to.eq(undefined);
      const error = body.errors[0];
      expect(error.field).to.eq('region');
      expect(error.reason).to.eq(createLinodeErrorMsg);
    });
    // window scrolls to top, RegionSelect displays error msg
    // Creation fails but not bc of factors related to this test setup
    cy.get('[data-qa-textfield-error-text="Region"]')
      .should('be.visible')
      .should('have.text', createLinodeErrorMsg);
  });
});

describe('aclpBetaServices feature flag disabled', function () {
  it('Alerts not present when feature flag disabled', function () {
    const mockEnabledRegion = regionFactory.build({
      capabilities: ['Linodes'],
      monitors: {
        alerts: ['Linodes'],
      },
    });
    const mockRegions = [mockEnabledRegion];
    cy.wrap(mockRegions).as('mockRegions');
    mockGetRegions(mockRegions).as('getRegions');
    mockAppendFeatureFlags({
      aclpBetaServices: {
        linode: {
          alerts: false,
          metrics: false,
        },
      },
    }).as('getFeatureFlags');
    mockGetUserPreferences({ isAclpAlertsBeta: true }).as('getUserPreferences');
    // const createLinodeErrorMsg = 'region is not valid';
    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions', '@getUserPreferences']);
    ui.regionSelect.find().click();

    const mockRegionAvailability = [
      regionAvailabilityFactory.build({
        available: true,
        region: mockEnabledRegion.id,
      }),
    ];
    mockGetRegionAvailability(mockEnabledRegion.id, mockRegionAvailability).as(
      'getRegionAvailability'
    );
    ui.regionSelect.find().type(`${mockEnabledRegion.label}{enter}`);
    cy.wait('@getRegionAvailability');

    cy.get('[data-qa-panel="Alerts"]').should('not.exist');
  });
});
