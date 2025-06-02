import { userPreferencesFactory } from '@linode/utilities';
import { linodeFactory } from '@linode/utilities';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import type { UserPreferences } from '@linode/api-v4';

describe('ACLP Components UI when aclpIntegration feature flag disabled', () => {
  // TODO: what is proper definition of a) downgrade banner  b) legacy metrics
  // TODO: M3-10057 modify these tests when aclpIntegration ff removed
  it('Upgrade banner not display when isAclpAlertsBeta is false', () => {
    mockAppendFeatureFlags({
      aclpIntegration: false,
    }).as('getFeatureFlags');
    const userPreferences = userPreferencesFactory.build({
      isAclpAlertsBeta: false,
    } as Partial<UserPreferences>);
    mockGetUserPreferences(userPreferences).as('getUserPreferences');
    const mockLinodeRegion = chooseRegion({
      capabilities: ['Linodes'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getLinode']);

    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        // upgrade banner does not display
        cy.get('[data-testid="alerts-preference-banner-text"]').should(
          'not.exist'
        );
      });
  });

  it('ACLP alerts downgrade button not appear and legacy UI displays when isAclpAlertsBeta is true', () => {
    mockAppendFeatureFlags({
      aclpIntegration: false,
    }).as('getFeatureFlags');
    const userPreferences = userPreferencesFactory.build({
      isAclpAlertsBeta: true,
    } as Partial<UserPreferences>);
    mockGetUserPreferences(userPreferences).as('getUserPreferences');
    const mockLinodeRegion = chooseRegion({
      capabilities: ['Linodes'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getLinode']);

    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        // upgrade banner is not visible
        cy.get('[data-testid="alerts-preference-banner-text"]').should(
          'not.exist'
        );
        // legacy header of "Alerts" and not "Default Alerts" is displayed
        cy.findByText('Alerts').should('be.visible');
        // // downgrade button is not visible
        cy.findByText('Switch to legacy Alerts').should('not.exist');
      });
  });

  it('Uppgrade banner not display when isAclpMetricBeta is false', () => {
    mockAppendFeatureFlags({
      aclpIntegration: false,
    }).as('getFeatureFlags');
    const userPreferences = userPreferencesFactory.build({
      isAclpMetricBeta: false,
    } as Partial<UserPreferences>);
    mockGetUserPreferences(userPreferences).as('getUserPreferences');
    const mockLinodeRegion = chooseRegion({
      capabilities: ['Linodes'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getLinode']);

    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        // upgrade banner does not display
        cy.get('[data-testid="alerts-preference-banner-text"]').should(
          'not.exist'
        );
      });
  });

  it('ACLP alerts downgrade button not appear and legacy UI displays when isAclpMetricBeta is true', () => {
    mockAppendFeatureFlags({
      aclpIntegration: false,
      // aclp: { beta: true, enabled: true },
    }).as('getFeatureFlags');
    const userPreferences = userPreferencesFactory.build({
      isAclpMetricBeta: true,
    } as Partial<UserPreferences>);
    mockGetUserPreferences(userPreferences).as('getUserPreferences');
    const mockLinodeRegion = chooseRegion({
      capabilities: ['Linodes'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
    cy.wait(['@getFeatureFlags', '@getUserPreferences', '@getLinode']);

    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        // upgrade banner is not visible
        cy.get('[data-testid="alerts-preference-banner-text"]').should(
          'not.exist'
        );
        // legacy header of "Alerts" and not "Default Alerts" is displayed
        cy.findByText('Alerts').should('be.visible');
        // downgrade button is not visible
        cy.findByText('Switch to legacy Alerts').should('not.exist');
      });
  });
});
