/**
 * @file Integration tests for CloudPulse navigation.
 */

import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetAccount } from 'support/intercepts/account';
import { accountFactory } from 'src/factories';
import { ui } from 'support/ui';

const mockAccount = accountFactory.build();

describe('CloudPulse  navigation', () => {
  beforeEach(() => {
    mockGetAccount(mockAccount).as('getAccount');
  });

  /*
   * - Confirms that Cloudpulse navigation item is shown when feature flag is enabled.
   * - Confirms that clicking Cloudpulse navigation item directs user to Cloudpulse landing page.
   */
  it('can navigate to Cloudpulse landing page', () => {
    mockAppendFeatureFlags({
      aclp: {
        beta: true,
        enabled: true,
      },
    }).as('getFeatureFlags');

    cy.visitWithLogin('/linodes');
    cy.wait('@getFeatureFlags');

    ui.nav.findItemByTitle('Monitor').should('be.visible').click();
    cy.url().should('endWith', '/cloudpulse');
  });

  /*
   * - Confirms that Cloudpulse navigation item is not shown when feature flag is disabled.
   */
  it('does not show  Cloudpulse navigation item when feature is disabled', () => {
    mockAppendFeatureFlags({
      aclp: {
        beta: true,
        enabled: false,
      },
    }).as('getFeatureFlags');

    cy.visitWithLogin('/linodes');
    cy.wait('@getFeatureFlags');

    ui.nav.find().within(() => {
      cy.findByText('Monitor').should('not.exist');
    });
  });

  /*
   * - Confirms that manual navigation to Cloudpulse landing page with feature is disabled displays Not Found to user.
   */
  it('displays Not Found when manually navigating to /cloudpulse with feature flag disabled', () => {
    mockAppendFeatureFlags({
      aclp: {
        beta: true,
        enabled: false,
      },
    }).as('getFeatureFlags');

    cy.visitWithLogin('monitor/cloudpulse');
    cy.wait('@getFeatureFlags');

    cy.findByText('Not Found').should('be.visible');
  });
});
