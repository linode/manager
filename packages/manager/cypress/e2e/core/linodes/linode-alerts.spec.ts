// TODO: rename this file after other outstanding PRs merged, to be consistent w/ their naming convention
import { linodeFactory, regionFactory } from '@linode/utilities';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';

import {
  ALERTS_BETA_MODE_BANNER_TEXT,
  ALERTS_BETA_MODE_BUTTON_TEXT,
  ALERTS_LEGACY_MODE_BANNER_TEXT,
  ALERTS_LEGACY_MODE_BUTTON_TEXT,
} from 'src/features/Linodes/constants';
/*
 * UI of Linode alerts tab based on region enablement of alerts and isAclpAlertsBeta user preference
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
    mockGetRegions([mockEnabledRegion]).as('getRegions');
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockEnabledRegion.id,
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
  });
  it('isAclpAlertsBeta disabled', function () {
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.wait([
      '@getFeatureFlags',
      '@getRegions',
      '@getLinode',
      '@getUserPreferences',
    ]);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.contains('Default Alerts').should('be.visible');
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
      .should('be.enabled');
  });

  it('isAclpAlertsBeta enabled', () => {
    mockGetUserPreferences({ isAclpAlertsBeta: true }).as('getUserPreferences');
    cy.wait([
      '@getFeatureFlags',
      '@getRegions',
      '@getLinode',
      '@getUserPreferences',
    ]);
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
      });
  });
});

describe('region disables alerts. beta alerts not available regardless of user preference', function () {
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

    mockGetRegions([mockDisabledRegion]).as('getRegions');
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockDisabledRegion.id,
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
  });
  it('isAclpAlertsBeta disabled', () => {
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.wait([
      '@getFeatureFlags',
      '@getRegions',
      '@getLinode',
      '@getUserPreferences',
    ]);
    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-testid="notice-info"]').should('not.exist');
  });

  it('isAclpAlertsBeta enabled', () => {
    mockGetUserPreferences({ isAclpAlertsBeta: true }).as('getUserPreferences');
    cy.wait([
      '@getFeatureFlags',
      '@getRegions',
      '@getLinode',
      '@getUserPreferences',
    ]);

    ui.tabList.findTabByTitle('Alerts').within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
    cy.get('[data-testid="notice-info"]').should('not.exist');
  });
});
