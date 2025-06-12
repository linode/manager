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

describe('ACLP alerts in Linode create flow', function () {
  this.beforeEach(() => {
    const mockAccount = accountFactory.build();
    mockGetRegions([chooseRegion()]).as('getRegions');
    mockGetAccount(mockAccount);
  });
  // UI displays beta metrics, can switch to legacy view
  it('alerts are present if aclpIntegration is enabled', function () {
    mockAppendFeatureFlags({
      aclpIntegration: true,
    }).as('getFeatureFlags');
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.visitWithLogin('/linodes/create');
    cy.wait([
      '@getFeatureFlags',
      '@getUserPreferences',
      '@getRegions',
      // '@getLinode',
      // '@getCloudPulseService',
      // '@getDashboardError',
    ]);
    cy.get('[data-qa-panel="Alerts"]').scrollIntoView();
    cy.get('[data-qa-panel="Alerts"]').within(() => {
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
      });
    });
    //   "Additional Options" section is present

    // if no user preference, legacy alerts UI is displayed

    // user can upgrade from legacy alerts to ACLP alerts

    // user can downgrade from ACLP alerts to legacy alerts
  });

  xit('user preference for beta alerts', function () {
    mockAppendFeatureFlags({
      aclpIntegration: true,
    }).as('getFeatureFlags');
    mockGetUserPreferences({ isAclpAlertsBeta: true }).as('getUserPreferences');
    cy.visitWithLogin('/linodes/create');
  });

  xit('user preference for legacy alerts', function () {
    mockAppendFeatureFlags({
      aclpIntegration: true,
    }).as('getFeatureFlags');
    mockGetUserPreferences({ isAclpAlertsBeta: false }).as(
      'getUserPreferences'
    );
    cy.visitWithLogin('/linodes/create');
  });

  xit('alerts are not present if aclpIntegration is disabled', function () {
    mockAppendFeatureFlags({
      aclpIntegration: false,
    }).as('getFeatureFlags');
    cy.visitWithLogin('/linodes/create');
  });
  // TODO: how can region disable alerts? if alerts enabled, can see Alerts before region selected
});
