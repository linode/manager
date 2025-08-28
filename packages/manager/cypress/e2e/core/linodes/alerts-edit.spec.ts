import { linodeFactory, regionFactory } from '@linode/utilities';
import { mockGetAlertDefinition } from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  interceptUpdateLinode,
  mockGetLinodeDetails,
} from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { assertLinodeAlertsEnabled } from 'support/util/linodes';
import { randomLabel } from 'support/util/random';

import { alertFactory } from 'src/factories';
import {
  ALERTS_BETA_MODE_BANNER_TEXT,
  ALERTS_BETA_MODE_BUTTON_TEXT,
  ALERTS_BETA_PROMPT,
  ALERTS_LEGACY_MODE_BANNER_TEXT,
  ALERTS_LEGACY_MODE_BUTTON_TEXT,
  ALERTS_LEGACY_PROMPT,
} from 'src/features/Linodes/constants';

const MOCK_LINODE_ID = 2;
const mockDisabledLegacyAlerts = {
  cpu: 0,
  io: 0,
  network_in: 0,
  network_out: 0,
  transfer_quota: 0,
};
const mockEnabledLegacyAlerts = {
  cpu: 180,
  io: 10000,
  network_in: 10,
  network_out: 10,
  transfer_quota: 80,
};

const mockDisabledBetaAlerts = {
  system: [],
  user: [],
};

const mockEnabledBetaAlerts = {
  system: [1, 2],
  user: [3],
};

/*
 * UI of Linode alerts tab based on beta and legacy alert values in linode.alerts. Dependent on region support for alerts
 * Legacy alerts = 0, Beta alerts = [] (empty arrays or no values at all) => legacy disabled for `beta` stage OR beta disabled for `ga` stage
 * Legacy alerts > 0, Beta alerts = [] (empty arrays or no values at all) => legacy enabled
 * Legacy alerts = 0, Beta alerts has values (either system, user, or both) => beta enabled
 * Legacy alerts > 0, Beta alerts has values (either system, user, or both) => beta enabled
 *
 * Note: Here, "disabled" means that all toggles are in the OFF state, but it's still editable (not read-only)
 */

describe('region enables alerts', function () {
  beforeEach(() => {
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
    const mockEnabledRegion = regionFactory.build({
      capabilities: ['Linodes'],
      monitors: {
        alerts: ['Linodes'],
      },
    });
    cy.wrap(mockEnabledRegion).as('mockEnabledRegion');
    mockGetRegions([mockEnabledRegion]).as('getRegions');

    const alertDefinitions = [
      alertFactory.build({
        id: 1,
        description: randomLabel(),
        label: randomLabel(),
        service_type: 'linode',
        severity: 1,
        status: 'enabled',
        type: 'system',
        entity_ids: [MOCK_LINODE_ID.toString()],
      }),
      alertFactory.build({
        id: 2,
        description: randomLabel(),
        label: randomLabel(),
        service_type: 'linode',
        severity: 1,
        status: 'enabled',
        type: 'system',
        entity_ids: [MOCK_LINODE_ID.toString()],
      }),
      alertFactory.build({
        id: 3,
        description: randomLabel(),
        label: randomLabel(),
        service_type: 'linode',
        severity: 1,
        status: 'enabled',
        type: 'user',
        entity_ids: [MOCK_LINODE_ID.toString()],
      }),
    ];
    cy.wrap(alertDefinitions).as('alertDefinitions');
    mockGetAlertDefinition('linode', alertDefinitions).as(
      'getAlertDefinitions'
    );
  });

  xit('Legacy alerts = 0, Beta alerts = [] => legacy disabled', function () {
    const mockLinode = linodeFactory.build({
      id: MOCK_LINODE_ID,
      label: randomLabel(),
      region: this.mockEnabledRegion.id,
      alerts: {
        ...mockDisabledLegacyAlerts,
        ...mockDisabledBetaAlerts,
      },
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinode']);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(ALERTS_LEGACY_MODE_BANNER_TEXT);
          });
        // alerts are disabled so all toggles are off
        ui.toggle.find().each(($toggle) => {
          cy.wrap($toggle).should('have.attr', 'data-qa-toggle', 'false');
        });
      });

    // upgrade from legacy alerts to ACLP alerts
    ui.button
      .findByTitle(ALERTS_LEGACY_MODE_BUTTON_TEXT)
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('be.visible');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
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

        cy.wait(['@getAlertDefinitions']);
        assertLinodeAlertsEnabled(this.alertDefinitions);
      });
  });

  xit('Legacy alerts > 0, Beta alerts = [] => legacy enabled. can upgrade to beta enabled', function () {
    const mockLinode = linodeFactory.build({
      id: MOCK_LINODE_ID,
      label: randomLabel(),
      region: this.mockEnabledRegion.id,
      alerts: {
        // legacy alerts are enabled if value > 0
        ...mockEnabledLegacyAlerts,
      },
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinode']);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(ALERTS_LEGACY_MODE_BANNER_TEXT);
          });

        // alerts are enabled so all toggles are on if val > 0
        ui.toggle.find().each(($toggle) => {
          cy.wrap($toggle).should('have.attr', 'data-qa-toggle', 'true');
        });
      });

    // upgrade from legacy alerts to ACLP alerts
    ui.button
      .findByTitle(ALERTS_LEGACY_MODE_BUTTON_TEXT)
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('be.visible');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(ALERTS_BETA_MODE_BANNER_TEXT);
          });
        cy.wait(['@getAlertDefinitions']);
        // toggles in table are on but can be turned off
        assertLinodeAlertsEnabled(this.alertDefinitions);

        interceptUpdateLinode(mockLinode.id).as('updateLinode');
        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
  });

  xit('Legacy alerts = 0, Beta alerts > 0, => beta enabled', function () {
    const mockLinode = linodeFactory.build({
      id: 2,
      label: randomLabel(),
      region: this.mockEnabledRegion.id,
      alerts: {
        ...mockDisabledLegacyAlerts,
        ...mockEnabledBetaAlerts,
      },
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinode']);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('be.visible');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(ALERTS_BETA_MODE_BANNER_TEXT);
          });
        cy.wait(['@getAlertDefinitions']);
        assertLinodeAlertsEnabled(this.alertDefinitions);
      });

    // downgrade from ACLP alerts to legacy alerts
    ui.button
      .findByTitle(ALERTS_BETA_MODE_BUTTON_TEXT)
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(ALERTS_LEGACY_MODE_BANNER_TEXT);
          });
        // alerts are disabled so all toggles are off
        ui.toggle.find().each(($toggle) => {
          cy.wrap($toggle)
            .should('have.attr', 'data-qa-toggle', 'false')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });
        // possible to upgrade to beta
        ui.button
          .findByTitle(ALERTS_LEGACY_MODE_BUTTON_TEXT)
          .should('be.visible')
          .should('be.enabled');

        // can save changes
        ui.button.findByTitle('Save').should('be.visible').should('be.enabled');
      });
  });

  xit('Legacy alerts > 0, Beta alerts > 0, => beta enabled. can downgrade to legacy enabled', function () {
    const mockLinode = linodeFactory.build({
      id: MOCK_LINODE_ID,
      label: randomLabel(),
      region: this.mockEnabledRegion.id,
      alerts: {
        ...mockEnabledLegacyAlerts,
        ...mockEnabledBetaAlerts,
      },
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinode']);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('be.visible');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(ALERTS_BETA_MODE_BANNER_TEXT);
          });
        cy.wait(['@getAlertDefinitions']);
        assertLinodeAlertsEnabled(this.alertDefinitions);
        // downgrade from ACLP alerts to legacy alerts
        ui.button
          .findByTitle(ALERTS_BETA_MODE_BUTTON_TEXT)
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // beta alerts UI loaded
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(ALERTS_LEGACY_MODE_BANNER_TEXT);
          });
        // turn the toggles off
        ui.toggle
          .find()
          .should('have.attr', 'data-qa-toggle', 'true')
          .should('be.visible')
          .click({ multiple: true });
        ui.toggle.find().should('have.attr', 'data-qa-toggle', 'false');

        interceptUpdateLinode(mockLinode.id).as('updateLinode');
        cy.scrollTo('bottom');
        // save changes
        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    ui.dialog
      .findByTitle(ALERTS_LEGACY_PROMPT)
      .should('be.visible')
      .within(() => {
        ui.button.findByTitle('Confirm').should('be.visible').click();
      });
  });

  xit('in default beta mode, edits to beta alerts do not trigger confirmation modal', function () {
    const mockLinode = linodeFactory.build({
      id: 2,
      label: randomLabel(),
      region: this.mockEnabledRegion.id,
      alerts: {
        ...mockEnabledBetaAlerts,
      },
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinode']);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('be.visible');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(ALERTS_BETA_MODE_BANNER_TEXT);
          });
        cy.wait(['@getAlertDefinitions']);
        // toggles in table are on but can be turned off
        assertLinodeAlertsEnabled(this.alertDefinitions);

        interceptUpdateLinode(mockLinode.id).as('updateLinode');
        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // M3-10369: "Save Alerts?" prompt does not appear bc beta is already default mode
    ui.dialog.find().should('not.exist');
  });

  xit('in default legacy mode, edits to beta alerts trigger confirmation modal ', function () {
    const mockLinode = linodeFactory.build({
      id: 2,
      label: randomLabel(),
      region: this.mockEnabledRegion.id,
      alerts: {
        ...mockEnabledLegacyAlerts,
      },
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinode']);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(ALERTS_LEGACY_MODE_BANNER_TEXT);
          });
      });

    // upgrade from legacy alerts to ACLP alerts
    ui.button
      .findByTitle(ALERTS_LEGACY_MODE_BUTTON_TEXT)
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('be.visible');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]')
          .should('be.visible')
          .within(() => {
            cy.contains(ALERTS_BETA_MODE_BANNER_TEXT);
          });
        cy.wait(['@getAlertDefinitions']);
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
                  // each alert's toggle should be enabled/on/true and editable
                  ui.toggle
                    .find()
                    .should('have.attr', 'data-qa-toggle', 'true')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                  ui.toggle
                    .find()
                    .should('have.attr', 'data-qa-toggle', 'false');
                });
            });
          });

        interceptUpdateLinode(mockLinode.id).as('updateLinode');
        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // M3-10369: "Save Alerts?" prompt appears bc of edits to beta alerts but linode was previously in legacy mode
    ui.dialog
      .findByTitle(ALERTS_BETA_PROMPT)
      .should('be.visible')
      .within(() => {
        ui.button.findByTitle('Confirm').should('be.visible').click();
      });
  });
});

describe('region disables alerts. beta alerts not available regardless of linode settings', function () {
  beforeEach(() => {
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

    const mockDisabledRegion = regionFactory.build({
      capabilities: ['Linodes'],
      monitors: {
        alerts: [],
      },
    });
    cy.wrap(mockDisabledRegion).as('mockDisabledRegion');
    mockGetRegions([mockDisabledRegion]).as('getRegions');
  });

  xit('Legacy alerts = 0, Beta alerts > 0,  => legacy disabled', function () {
    const mockLinode = linodeFactory.build({
      id: MOCK_LINODE_ID,
      label: randomLabel(),
      region: this.mockDisabledRegion.id,
      alerts: {
        ...mockDisabledLegacyAlerts,
        ...mockEnabledBetaAlerts,
      },
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinode']);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]').should('not.exist');
        // not possible to upgrade or downgrade
        cy.findByText(ALERTS_LEGACY_MODE_BUTTON_TEXT).should('not.exist');
        cy.findByText(ALERTS_BETA_MODE_BUTTON_TEXT).should('not.exist');
        // alerts are disabled so all toggles are off but are not readonly
        ui.toggle.find().each(($toggle) => {
          cy.wrap($toggle)
            .should('have.attr', 'data-qa-toggle', 'false')
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.wrap($toggle).should('have.attr', 'data-qa-toggle', 'true');
        });
      });
  });

  xit('Legacy alerts > 0, Beta alerts = 0,  => legacy enabled', function () {
    const mockLinode = linodeFactory.build({
      id: MOCK_LINODE_ID,
      label: randomLabel(),
      region: this.mockDisabledRegion.id,
      alerts: { ...mockEnabledLegacyAlerts },
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinode']);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Alerts').should('be.visible');
        cy.get('[data-testid="notice-info"]').should('not.exist');
        // not possible to upgrade or downgrade
        cy.findByText(ALERTS_LEGACY_MODE_BUTTON_TEXT).should('not.exist');
        cy.findByText(ALERTS_BETA_MODE_BUTTON_TEXT).should('not.exist');
        // legacy alerts are enabled
        ui.toggle.find().each(($toggle) => {
          cy.wrap($toggle)
            .should('have.attr', 'data-qa-toggle', 'true')
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.wrap($toggle).should('have.attr', 'data-qa-toggle', 'false');
        });
      });
  });

  it('Deleting entire value in numeric input triggers validation error', function () {
    const mockLinode = linodeFactory.build({
      id: MOCK_LINODE_ID,
      label: randomLabel(),
      region: this.mockDisabledRegion.id,
      alerts: { ...mockEnabledLegacyAlerts },
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getRegions', '@getLinode']);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        const strNumericInputSelector = 'input[data-testid="textfield-input"]';
        // each data-qa-alerts-panel contains a toggle button and a numeric input
        cy.get('[data-qa-alerts-panel="true"]').each((panel) => {
          cy.wrap(panel).within(() => {
            // toggle button is enabled
            ui.toggle
              .find()
              .should('have.attr', 'data-qa-toggle', 'true')
              .should('be.visible')
              .should('be.enabled');
            cy.get('label[data-qa-alert]')
              .invoke('attr', 'data-qa-alert')
              .then((lbl) => {
                cy.get(strNumericInputSelector).clear();
                cy.get(strNumericInputSelector).blur();
                // error appears in numeric input
                cy.get('p[data-qa-textfield-error-text]')
                  .should('be.visible')
                  .then(($err) => {
                    // use the toggle button's label to get the full error msg
                    expect($err).to.contain(`${lbl} is required.`);
                  });
                // toggle button is not disabled by the error
                ui.toggle
                  .find()
                  .should('have.attr', 'data-qa-toggle', 'true')
                  .should('be.enabled');
                cy.get(strNumericInputSelector).click();
                cy.get(strNumericInputSelector).type('1');
                // error is removed
                cy.get('p[data-qa-textfield-error-text]').should('not.exist');
              });
          });
        });
      });
  });
});
