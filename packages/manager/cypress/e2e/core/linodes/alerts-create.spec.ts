import { regionAvailabilityFactory, regionFactory } from '@linode/utilities';
import { mockGetAccountSettings } from 'support/intercepts/account';
import { mockGetAlertDefinition } from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import {
  mockGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';

import { accountSettingsFactory, alertFactory } from 'src/factories';
import {
  ALERTS_BETA_MODE_BANNER_TEXT,
  ALERTS_BETA_MODE_BUTTON_TEXT,
  ALERTS_LEGACY_MODE_BANNER_TEXT,
  ALERTS_LEGACY_MODE_BUTTON_TEXT,
} from 'src/features/Linodes/constants';

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
      aclpServices: {
        linode: {
          alerts: {
            beta: true,
            enabled: true,
          },
          metrics: {
            beta: false,
            enabled: false,
          },
        },
      },
    }).as('getFeatureFlags');
    // mock network interface type in case test account has setting that disables <pre><code> snippet
    const mockInitialAccountSettings = accountSettingsFactory.build({
      interfaces_for_new_linodes: 'legacy_config_default_but_linode_allowed',
    });
    mockGetAccountSettings(mockInitialAccountSettings).as('getSettings');
  });

  it('Alerts panel becomes visible after switching to region w/ alerts enabled', function () {
    const disabledRegion = this.mockRegions[1];
    mockGetRegionAvailability(disabledRegion.id, []).as(
      'getRegionAvailability'
    );
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getRegions']);

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

  it('create flow defaults to legacy alerts', function () {
    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getSettings', '@getRegions']);
    ui.regionSelect.find().click();
    const enabledRegion = this.mockRegions[0];
    mockGetRegionAvailability(enabledRegion.id, []).as('getRegionAvailability');
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);

    // legacy alerts panel appears
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

        // legacy alert form
        // inputs are ON but readonly, cant be added to POST
        cy.get('[data-qa-alerts-panel="true"]').each((panel) => {
          cy.wrap(panel).within(() => {
            ui.toggle
              .find()
              .should('have.attr', 'data-qa-toggle', 'true')
              .should('be.visible')
              .should('be.disabled');
            // numeric inputs are disabled
            cy.get('[type="number"]')
              .should('be.visible')
              .should('be.disabled');
          });
        });
      });

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

  it('create flow after switching to beta alerts', function () {
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
    cy.wait(['@getFeatureFlags', '@getSettings', '@getRegions']);
    ui.regionSelect.find().click();
    const enabledRegion = this.mockRegions[0];
    mockGetRegionAvailability(enabledRegion.id, []).as('getRegionAvailability');
    ui.regionSelect.find().type(`${enabledRegion.label}{enter}`);

    // legacy alerts panel appears
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
          // switch to beta
          // alerts are off/false but enabled, can switch to on/true
          ui.button
            .findByTitle(ALERTS_LEGACY_MODE_BUTTON_TEXT)
            .should('be.visible')
            .should('be.enabled')
            .click();
        });
      });
    cy.wait(['@getAlertDefinitions']);

    // verify summary at bottom displays 0 alerts selected
    cy.scrollTo('bottom');
    cy.get('[data-qa-linode-create-summary="true"]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts Assigned');
        cy.contains('0');
      });
    // scroll back up to alerts table, select beta alerts
    cy.get('table[data-testid="alert-table"]').scrollIntoView();
    cy.get('table[data-testid="alert-table"]')
      .should('be.visible')
      .find('tbody > tr')
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
              // value is now on/true
              ui.toggle.find().should('have.attr', 'data-qa-toggle', 'true');
            });
          cy.get('td')
            .eq(1)
            .within(() => {
              cy.findByText(alertDefinitions[index].label).should('be.visible');
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
    // verify alerts counter in summary displays number selected
    cy.scrollTo('bottom');
    // summary displays number of alerts ("+3")
    cy.get('[data-qa-linode-create-summary="true"]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts Assigned');
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

  it('can toggle from legacy to beta alerts and back to legacy', function () {
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getRegions']);
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
          cy.contains(ALERTS_LEGACY_MODE_BANNER_TEXT);
        });
    });
    // legacy alert form, inputs are ON but readonly
    cy.get('[data-qa-alerts-panel="true"]').each((panel) => {
      cy.wrap(panel).within(() => {
        ui.toggle
          .find()
          .should('have.attr', 'data-qa-toggle', 'true')
          .should('be.visible')
          .should('be.disabled');
        // numeric inputs are disabled
        cy.get('[type="number"]').should('be.visible').should('be.disabled');
      });
    });

    // upgrade from legacy alerts to beta alerts
    ui.button
      .findByTitle(ALERTS_LEGACY_MODE_BUTTON_TEXT)
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
            cy.contains(ALERTS_BETA_MODE_BANNER_TEXT);
          });
        // possible to downgrade from ACLP alerts to legacy alerts
        ui.button
          .findByTitle(ALERTS_BETA_MODE_BUTTON_TEXT)
          .should('be.visible')
          .should('be.enabled');
      });
  });

  it('alerts not present for region where alerts disabled', function () {
    const createLinodeErrorMsg = 'region is not valid';
    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions']);
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
    // no alerts panel
    cy.get('[data-qa-panel="Alerts"]').should('not.exist');
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

describe('aclpServices feature flag disabled', function () {
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
      aclpServices: {
        linode: {
          alerts: {
            beta: false,
            enabled: false,
          },
          metrics: {
            beta: false,
            enabled: false,
          },
        },
      },
    }).as('getFeatureFlags');
    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getRegions']);
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
