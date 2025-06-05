import { linodeFactory } from '@linode/utilities';
import {
  mockGetCloudPulseDashboardByIdError,
  mockGetCloudPulseServiceByServiceType,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { mockGetLinodeStats } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { serviceTypesFactory } from 'src/factories';
// TODO: what is proper description? and proper filename for this file?
describe('ACLP Components UI varies according to ACLP support', () => {
  beforeEach(() => {
    const mockRegion = chooseRegion({
      capabilities: ['Linodes'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockRegion.id,
    });
    const mockService = serviceTypesFactory.build({
      label: 'Linodes',
      service_type: 'linode',
      regions: mockRegion.id,
    });
    mockGetCloudPulseServiceByServiceType('linode', mockService).as(
      'getCloudPulseService'
    );
    // TODO: move to a util file? this is pretty specific to this test, shd it stay in this file?
    const generateStats = (modifier = 1): [number, number][] => {
      const stat: [number, number][] = [];
      let i = 0;
      for (i; i < 200; i++) {
        const item: [number, number] = [0, 0];
        item[0] = Date.now() - i * 300000;
        item[1] = Math.random() * modifier;
        stat.push(item);
      }
      return stat;
    };
    const netStats = {
      in: generateStats(3),
      out: generateStats(2),
      private_in: generateStats(0),
      private_out: generateStats(0),
    };

    const mockStats = {
      data: {
        cpu: generateStats(4),
        io: { io: generateStats(3), swap: generateStats(3) },
        netv4: netStats,
        netv6: netStats,
      },
      title: 'mock title',
    };
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    // TODO: fix data
    mockGetLinodeStats(mockLinode.id, mockStats).as('getLinodeStats');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/metrics`);
  });
  it('if ACLP is supported, user can opt in to aclp beta', () => {
    const msgBeta =
      'Try the new Metrics (Beta) with more options and greater flexibility for better data analysis. You can switch back to the current view at any time.';
    mockAppendFeatureFlags({
      aclpIntegration: true,
    }).as('getFeatureFlags');
    mockGetUserPreferences({ isAclpMetricsBeta: false }).as('getUserPrefences');
    // linodeDashboardId is hardcoded in LinodeMetrics.tsx to 2
    // error message is not displayed
    mockGetCloudPulseDashboardByIdError(2, '').as('getDashboardError');
    cy.wait([
      '@getFeatureFlags',
      '@getUserPrefences',
      '@getLinode',
      '@getCloudPulseService',
      '@getLinodeStats',
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
        cy.contains(msgBeta).should('be.visible');
        ui.button
          .findByTitle('Try the Metrics (Beta)')
          .should('be.visible')
          .should('be.enabled')
          .click();
        // wait for dashboard query to complete
        cy.wait('@getDashboardError');
        cy.contains(
          'Welcome to Metrics (Beta) with more options and greater flexibility for better data analysis.'
        ).should('be.visible');
        cy.contains(msgBeta).should('not.exist');
        ui.button
          .findByTitle('Switch to legacy Metrics')
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

  it('if ACLP is not supported, aclp beta is not offered', () => {
    mockAppendFeatureFlags({
      aclpIntegration: false,
    }).as('getFeatureFlags');
    // these mock preferences should not affect result, beta should be hidden regardless of preference
    mockGetUserPreferences({ isAclpMetricsBeta: false }).as('getUserPrefences');

    cy.wait([
      '@getFeatureFlags',
      '@getUserPrefences',
      '@getLinode',
      '@getCloudPulseService',
      '@getLinodeStats',
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
        // banner and button to switch to beta do not exist
        cy.get('[data-testid="metrics-preference-banner-text"]').should(
          'not.exist'
        );
        cy.findByText('Try the Metrics (Beta)').should('not.exist');
        // legacy metrics view of LinodeSummary component is displayed
        cy.get('[data-testid="linode-summary"]').should('be.visible');
      });
  });
});
