import { regionFactory, userPreferencesFactory } from '@linode/utilities';
import { linodeFactory } from '@linode/utilities';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { randomLabel, randomNumber } from 'support/util/random';

import type { UserPreferences } from '@linode/api-v4';

describe('User preferences for alerts and metrics have no effect when aclpServices alerts/metrics feature flag is disabled', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpServices: {
        linode: {
          alerts: { beta: false, enabled: false },
          metrics: { beta: false, enabled: false },
        },
      },
    }).as('getFeatureFlags');
    const mockRegion = regionFactory.build({
      capabilities: ['Managed Databases'],
      monitors: {
        alerts: ['Linodes'],
        metrics: ['Linodes'],
      },
    });
    mockGetRegions([mockRegion]).as('getRegions');
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockRegion.id,
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.wrap(mockLinode).as('mockLinode');
  });

  it('Alerts banner does not display when isAclpAlertsBeta is false', function () {
    const userPreferences = userPreferencesFactory.build({
      isAclpAlertsBeta: false,
    } as Partial<UserPreferences>);
    mockGetUserPreferences(userPreferences).as('getUserPreferences');
    cy.visitWithLogin(`/linodes/${this.mockLinode.id}/alerts`);
    cy.wait([
      '@getFeatureFlags',
      '@getUserPreferences',
      '@getRegions',
      '@getLinode',
    ]);

    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        // upgrade banner does not display
        cy.get('[data-testid="alerts-preference-banner-text"]').should(
          'not.exist'
        );
        // downgrade button is not visible
        cy.findByText('Switch to legacy Alerts').should('not.exist');
      });
  });

  it('Alerts downgrade button does not appear and legacy UI displays when isAclpAlertsBeta is true', function () {
    const userPreferences = userPreferencesFactory.build({
      isAclpAlertsBeta: true,
    } as Partial<UserPreferences>);
    mockGetUserPreferences(userPreferences).as('getUserPreferences');

    cy.visitWithLogin(`/linodes/${this.mockLinode.id}/alerts`);
    cy.wait([
      '@getFeatureFlags',
      '@getUserPreferences',
      '@getRegions',
      '@getLinode',
    ]);

    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        // upgrade banner is not visible
        cy.get('[data-testid="alerts-preference-banner-text"]').should(
          'not.exist'
        );
        // downgrade button is not visible
        cy.findByText('Switch to legacy Alerts').should('not.exist');
      });
  });

  it('Metrics banner does not display when isAclpMetricsBeta is false', function () {
    const userPreferences = userPreferencesFactory.build({
      isAclpMetricsBeta: false,
    } as Partial<UserPreferences>);
    mockGetUserPreferences(userPreferences).as('getUserPreferences');
    cy.visitWithLogin(`/linodes/${this.mockLinode.id}/metrics`);
    cy.wait([
      '@getFeatureFlags',
      '@getUserPreferences',
      '@getRegions',
      '@getLinode',
    ]);

    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        // upgrade banner is not visible
        cy.get('[data-testid="metrics-preference-banner-text"]').should(
          'not.exist'
        );
        // downgrade button is not visible
        cy.findByText('Switch to legacy Metrics').should('not.exist');
      });
  });

  it('Metrics downgrade button does not appear and legacy UI displays when isAclpMetricsBeta is true', function () {
    const userPreferences = userPreferencesFactory.build({
      isAclpMetricsBeta: true,
    } as Partial<UserPreferences>);
    mockGetUserPreferences(userPreferences).as('getUserPreferences');
    cy.visitWithLogin(`/linodes/${this.mockLinode.id}/metrics`);
    cy.wait([
      '@getFeatureFlags',
      '@getUserPreferences',
      '@getRegions',
      '@getLinode',
    ]);

    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        // upgrade banner is not visible
        cy.get('[data-testid="metrics-preference-banner-text"]').should(
          'not.exist'
        );
        // downgrade button is not visible
        cy.findByText('Switch to legacy Metrics').should('not.exist');
      });
  });
});
