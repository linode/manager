import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { ui } from 'support/ui';

import { accountFactory } from 'src/factories';

const creditCardExpiredBannerNotice =
  'Your credit card has expired! Please update your payment details.';

describe('Credit Card Expired Banner', () => {
  beforeEach(() => {
    mockGetUserPreferences({
      dismissed_notifications: {},
    });
    mockAppendFeatureFlags({
      // TODO M3-10491 - Remove `iamRbacPrimaryNavChanges` feature flag mock once flag is deleted.
      iamRbacPrimaryNavChanges: true,
    }).as('getFeatureFlags');
  });

  it('appears when the expiration date is in the past', () => {
    mockGetAccount(
      accountFactory.build({ credit_card: { expiry: '01/2000' } })
    ).as('getAccount');
    cy.visitWithLogin('/');
    cy.wait('@getAccount');
    cy.findByText(creditCardExpiredBannerNotice).should('be.visible');
    ui.button.findByTitle('Update Card').should('be.visible').click();

    // clicking on the link navigates to /billing
    cy.url().should('endWith', '/billing');
  });

  it('does not appear when the expiration date is in the future', () => {
    mockGetAccount(
      accountFactory.build({ credit_card: { expiry: '01/2999' } })
    ).as('getAccount');
    cy.visitWithLogin('/billing');
    cy.wait('@getAccount');
    cy.findByText('Payment Methods').should('be.visible');
    cy.findByText(creditCardExpiredBannerNotice).should('not.exist');
  });
});
