import { linodeFactory, regionFactory } from '@linode/utilities';
import { mockGetAlertDefinition } from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodeDetails,
  mockUpdateLinode,
} from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { assertLinodeAlertsEnabled } from 'support/util/linodes';
import { randomLabel, randomNumber } from 'support/util/random';

import { alertFactory } from 'src/factories';
import {
  ALERTS_BETA_MODE_BANNER_TEXT,
  ALERTS_BETA_MODE_BUTTON_TEXT,
  ALERTS_LEGACY_MODE_BANNER_TEXT,
  ALERTS_LEGACY_MODE_BUTTON_TEXT,
} from 'src/features/Linodes/constants';

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
 * Legacy alerts = 0, Beta alerts = [],  => legacy disabled
 * Legacy alerts > 0, Beta alerts = [], => legacy enabled
 * Legacy alerts = 0, Beta alerts > 0,  => beta enabled
 * Legacy alerts > 0, Beta alerts > 0,  => beta enabled
 */

describe('region enables alerts', function () {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpBetaServices: {
        linode: {
          alerts: true,
          metrics: false,
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
      }),
      alertFactory.build({
        id: 2,

        description: randomLabel(),
        label: randomLabel(),
        service_type: 'linode',
        severity: 1,
        status: 'enabled',
        type: 'system',
      }),
      alertFactory.build({
        id: 3,
        description: randomLabel(),
        label: randomLabel(),
        service_type: 'linode',
        severity: 1,
        status: 'enabled',
        type: 'user',
      }),
    ];
    cy.wrap(alertDefinitions).as('alertDefinitions');
    mockGetAlertDefinition('linode', alertDefinitions).as(
      'getAlertDefinitions'
    );
  });

  it('Legacy alerts = 0, Beta alerts = [] => legacy disabled', function () {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
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

  it('Legacy alerts > 0, Beta alerts = [] => legacy enabled. can upgrade to beta disabled', function () {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
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
        // toggles in table are off but can be turned on
        assertLinodeAlertsEnabled(this.alertDefinitions);

        mockUpdateLinode(mockLinode.id).as('updateLinode');
        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // TODO: this test passes but modal behavior will change when properly implemented in api (M3-10195)
    // ui.dialog
    //   .findByTitle('Save Alerts?')
    //   .should('be.visible')
    //   .within(() => {
    //     ui.button.findByTitle('Save').should('be.visible')
    //     .click();
    //   });
    // TODO: content of request.body not match prod, 'alerts' attribute missing here
    // cy.wait('@updateLinode').then((xhr) => {
    //   // can save changes. new beta alerts added in assertLinodeAlertsEnabled tests
    //   const edits = xhr.request.body;
    //   expect(JSON.stringify(edits.system)).to.equal(
    //     JSON.stringify(mockEnabledBetaAlerts.system)
    //   );
    //   expect(JSON.stringify(edits.user)).to.equal(
    //     JSON.stringify(mockEnabledBetaAlerts.user)
    //   );
    // });
  });

  it('Legacy alerts = 0, Beta alerts > 0, => beta disabled', function () {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
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

  it('Legacy alerts > 0, Beta alerts > 0, => beta disabled. can downgrade to legacy enabled', function () {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
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

        mockUpdateLinode(mockLinode.id).as('updateLinode');
        cy.scrollTo('bottom');
        // save changes
        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // TODO: this test passes but modal behavior will change when properly implemented in api (M3-10195)
    // cy.wait('@updateLinode').then((xhr) => {
    //   // can save changes. new beta alerts added in assertLinodeAlertsEnabled tests
    //   const actual = xhr.request.body;
    //   const expected = { alerts: mockDisabledLegacyAlerts };
    //   expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
    // });
  });
});

describe('region disables alerts. beta alerts not available regardless of linode settings', function () {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpBetaServices: {
        linode: {
          alerts: true,
          metrics: false,
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

  it('Legacy alerts = 0, Beta alerts > 0,  => legacy disabled', function () {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
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

  it('Legacy alerts > 0, Beta alerts = 0,  => legacy disabled', function () {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
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
        // alerts are disabled so all toggles are off but are not readonly
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
});
