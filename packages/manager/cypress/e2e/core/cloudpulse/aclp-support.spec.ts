import { linodeFactory } from '@linode/utilities';
import { regionFactory } from '@linode/utilities';
import { mockGetCloudPulseDashboardByIdError } from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { mockGetLinodeStats } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import {
  assertBetaMetricsNotAvailable,
  generateMockLegacyStats,
} from 'support/util/cloudpulse';
import { randomLabel, randomNumber } from 'support/util/random';

import {
  METRICS_BETA_MODE_BANNER_TEXT,
  METRICS_BETA_MODE_BUTTON_TEXT,
  METRICS_LEGACY_MODE_BANNER_TEXT,
  METRICS_LEGACY_MODE_BUTTON_TEXT,
} from 'src/features/Linodes/constants';

import type { Stats } from '@linode/api-v4';

/**
 * If feature flag and region supports aclp:
 *  If user preference enables aclp, then UI displays beta metrics w/ option to switch to legacy metrics
 *  If user preference disables aclp, then UI displays legacy metrics w/ option to switch to beta metrics
 *
 * If region does not support aclp, then the UI displays legacy metrics w/ no option to switch to beta metrics
 */
describe('ACLP Components UI varies according to ACLP support by region and user preference', function () {
  beforeEach(function () {
    mockAppendFeatureFlags({
      aclpServices: {
        linode: {
          alerts: { beta: false, enabled: false },
          metrics: { beta: true, enabled: true },
        },
      },
    }).as('getFeatureFlags');
  });
  describe('toggle user preference when region supports aclp', function () {
    beforeEach(function () {
      const mockRegion = regionFactory.build({
        capabilities: ['Managed Databases'],
        monitors: {
          metrics: ['Linodes'],
        },
      });
      mockGetRegions([mockRegion]).as('getRegions');
      const mockLinode = linodeFactory.build({
        id: randomNumber(),
        label: randomLabel(),
        region: mockRegion.id,
      });
      cy.wrap(mockLinode.id).as('mockLinodeId');
      mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');

      // linodeDashboardId is hardcoded in LinodeMetrics.tsx to 2
      // error param is not displayed
      const mockDashboardId = 2;
      cy.wrap(mockDashboardId).as('mockDashboardId');
      const mockDashboardError = 'mock dashboard error occurred';
      mockGetCloudPulseDashboardByIdError(
        mockDashboardId,
        mockDashboardError
      ).as('getDashboardError');
    });
    // UI displays beta metrics, can switch to legacy view
    it('user preference enables aclp', function () {
      mockGetUserPreferences({ isAclpMetricsBeta: true }).as(
        'getUserPreferences'
      );
      cy.visitWithLogin(`/linodes/${this.mockLinodeId}/metrics`);
      cy.wait([
        '@getFeatureFlags',
        '@getUserPreferences',
        '@getRegions',
        '@getLinode',
        '@getDashboardError',
      ]);
      // tab header is "Metrics Beta", not "Metrics"
      cy.get('[data-testid="Metrics"]')
        .should('be.visible')
        .should('be.enabled')
        .within(() => {
          cy.get('[data-testid="betaChip"]').should('be.visible');
        });
      cy.get('[data-reach-tab-panels]')
        .should('be.visible')
        .within(() => {
          // banner container but indeterminate what its content is
          cy.get('[data-testid="metrics-preference-banner-text"]').should(
            'be.visible'
          );
          cy.contains(METRICS_BETA_MODE_BANNER_TEXT).should('be.visible');

          ui.button
            .findByTitle(METRICS_BETA_MODE_BUTTON_TEXT)
            .should('be.visible')
            .should('be.enabled');
          // UI displays mock error msg
          cy.contains(
            `Error while loading Dashboard with Id - ${this.mockDashboardId}`
          );
        });
    });

    // UI displays legacy metrics, can switch to beta view
    it('user preference disables aclp', function () {
      mockGetUserPreferences({ isAclpMetricsBeta: false }).as(
        'getUserPreferences'
      );
      const mockLegacyStats: Stats = generateMockLegacyStats();
      mockGetLinodeStats(this.mockLinodeId, mockLegacyStats).as(
        'getLinodeStats'
      );
      cy.visitWithLogin(`/linodes/${this.mockLinodeId}/metrics`);
      cy.wait([
        '@getFeatureFlags',
        '@getLinode',
        '@getLinodeStats',
        '@getUserPreferences',
      ]);
      // tab header is "Metrics", not "Metrics Beta"
      cy.get('[data-testid="Metrics"]')
        .should('be.visible')
        .should('be.enabled')
        .within(() => {
          cy.get('[data-testid="betaChip"]').should('not.exist');
        });
      cy.get('[data-reach-tab-panels]')
        .should('be.visible')
        .within(() => {
          // banner container but indeterminate what its content is
          cy.get('[data-testid="metrics-preference-banner-text"]').should(
            'be.visible'
          );
          // expect legacy metrics view of LinodeSummary component to be displayed
          cy.get('[data-testid="linode-summary"]').should('be.visible');
          cy.contains(METRICS_LEGACY_MODE_BANNER_TEXT).should('be.visible');
          // switch to beta metrics
          ui.button
            .findByTitle(METRICS_LEGACY_MODE_BUTTON_TEXT)
            .should('be.visible')
            .should('be.enabled')
            .click();
          // wait for dashboard query to complete
          cy.wait('@getDashboardError');
          cy.contains(METRICS_BETA_MODE_BANNER_TEXT).should('be.visible');
          cy.contains(METRICS_LEGACY_MODE_BANNER_TEXT).should('not.exist');
          ui.button
            .findByTitle(METRICS_BETA_MODE_BUTTON_TEXT)
            .should('be.visible')
            .should('be.enabled');
        });
      // tab header is "Metrics Beta", not "Metrics"
      cy.get('[data-testid="Metrics"]')
        .should('be.visible')
        .should('be.enabled')
        .within(() => {
          cy.get('[data-testid="betaChip"]').should('be.visible');
        });
    });
  });

  describe('region does not support aclp', () => {
    beforeEach(() => {
      // does not support metrics bc missing monitors
      const mockRegion = regionFactory.build({
        capabilities: ['Managed Databases'],
      });
      mockGetRegions([mockRegion]).as('getRegions');
      const mockLinode = linodeFactory.build({
        id: randomNumber(),
        label: randomLabel(),
        region: mockRegion.id,
      });
      cy.wrap(mockLinode.id).as('mockLinodeId');
      mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
      const mockLegacyStats = generateMockLegacyStats();
      mockGetLinodeStats(mockLinode.id, mockLegacyStats).as('getLinodeStats');
    });
    // UI displays legacy metrics, no option to switch to beta view
    it('user preference enables aclp', function () {
      mockGetUserPreferences({ isAclpMetricsBeta: true }).as(
        'getUserPreferences'
      );
      cy.visitWithLogin(`/linodes/${this.mockLinodeId}/metrics`);
      assertBetaMetricsNotAvailable();
    });

    // UI displays legacy metrics, no option to switch to beta view
    it('user preference disables aclp', function () {
      mockGetUserPreferences({ isAclpMetricsBeta: false }).as(
        'getUserPreferences'
      );
      cy.visitWithLogin(`/linodes/${this.mockLinodeId}/metrics`);
      assertBetaMetricsNotAvailable();
    });
  });
});
