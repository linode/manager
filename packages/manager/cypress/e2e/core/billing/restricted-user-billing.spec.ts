/**
 * @file Integration tests for restricted user billing flows.
 */

import { paymentMethodFactory, profileFactory } from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { grantsFactory } from '@src/factories/grants';
import { mockGetPaymentMethods, mockGetUser } from 'support/intercepts/account';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { randomLabel } from 'support/util/random';

// Tooltip message that appears on disabled billing action buttons for restricted
// and child users.
const restrictedUserTooltip =
  "You don't have permissions to edit this Account.";

// Mock credit card payment method to use in tests.
const mockPaymentMethods = [
  paymentMethodFactory.build({
    data: {
      card_type: 'Visa',
      expiry: '12/2026',
      last_four: '1234',
    },
    is_default: false,
  }),
  paymentMethodFactory.build({
    data: {
      card_type: 'Visa',
      expiry: '12/2026',
      last_four: '5678',
    },
    is_default: true,
  }),
];

/**
 * Asserts that the billing contact "Edit" button is disabled.
 *
 * Additionally confirms that clicking the "Edit" button reveals a tooltip and
 * does not open the "Edit Billing Contact Info" drawer.
 *
 * @param tooltipText - Expected tooltip message to be shown to the user.
 */
const assertEditBillingInfoDisabled = (tooltipText: string) => {
  // Confirm Billing Contact section "Edit" button is disabled, then click it.
  cy.get('[data-qa-contact-summary]')
    .should('be.visible')
    .within(() => {
      ui.button
        .findByTitle('Edit')
        .should('be.visible')
        .should('be.disabled')
        .click();
    });

  // Assert that "Edit Contact Billing Info" drawer does not open and that tooltip is revealed.
  cy.get(`[data-qa-drawer-title="Edit Billing Contact Info"]`).should(
    'not.exist'
  );
  ui.tooltip.findByText(tooltipText).should('be.visible');
};

/**
 * Asserts that the billing contact "Edit" button is enabled.
 *
 * Additionally confirms that clicking the "Edit" button opens the "Edit Billing
 * Contact Info" drawer, then closes the drawer.
 */
const assertEditBillingInfoEnabled = () => {
  cy.get('[data-qa-contact-summary]')
    .should('be.visible')
    .within(() => {
      ui.button
        .findByTitle('Edit')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

  ui.drawer
    .findByTitle('Edit Billing Contact Info')
    .should('be.visible')
    .within(() => {
      ui.drawerCloseButton.find().click();
    });
};

/**
 * Asserts that the "Add Payment Method" button is disabled.
 *
 * Additionally confirms that clicking the "Add Payment Method" button reveals
 * a tooltip and does not open the "Add Payment Method" drawer.
 *
 * @param tooltipText - Expected tooltip message to be shown to the user.
 */
const assertAddPaymentMethodDisabled = (tooltipText: string) => {
  // Confirm that payment method action menu items are disabled.
  ui.actionMenu
    .findByTitle('Action menu for card ending in 1234')
    .should('be.visible')
    .should('be.enabled')
    .click();

  ['Make a Payment', 'Make Default', 'Delete'].forEach((menuItem: string) => {
    ui.actionMenuItem.findByTitle(menuItem).should('be.disabled');
  });

  // Dismiss action menu.
  cy.get('[data-qa-action-menu="true"]').click();

  // Confirm Billing Summary section "Add Payment Method" button is disabled, then click it.
  cy.get('[data-qa-billing-summary]')
    .should('be.visible')
    .within(() => {
      ui.button
        .findByTitle('Add Payment Method')
        .should('be.visible')
        .should('be.disabled')
        .click();
    });

  // Assert that "Add Payment Method" drawer does not open and that tooltip is revealed.
  cy.get(`[data-qa-drawer-title="Add Payment Method"]`).should('not.exist');
  ui.tooltip.findByText(tooltipText).should('be.visible');
};

/**
 * Asserts that the "Add Payment Method" button is enabled.
 *
 * Additionally confirms that clicking the "Add Payment Method" button opens the
 * "Add Payment Method" drawer, then closes the drawer.
 */
const assertAddPaymentMethodEnabled = () => {
  // Confirm that payment method action menu items are enabled.
  ui.actionMenu
    .findByTitle('Action menu for card ending in 1234')
    .should('be.visible')
    .should('be.enabled')
    .click();

  ['Make a Payment', 'Make Default', 'Delete'].forEach((menuItem: string) => {
    ui.actionMenuItem.findByTitle(menuItem).should('be.enabled');
  });

  // Dismiss action menu.
  cy.get('[data-qa-action-menu="true"]').click();

  cy.get('[data-qa-billing-summary]')
    .should('be.visible')
    .within(() => {
      ui.button
        .findByTitle('Add Payment Method')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

  ui.drawer
    .findByTitle('Add Payment Method')
    .should('be.visible')
    .within(() => {
      ui.drawerCloseButton.find().click();
    });
};

describe('restricted user billing flows', () => {
  beforeEach(() => {
    mockGetPaymentMethods(mockPaymentMethods);
  });

  // TODO Delete all of these tests when Parent/Child launches and flag is removed.
  describe('Parent/Child feature disabled', () => {
    beforeEach(() => {
      // Mock the Parent/Child feature flag to be enabled.
      mockAppendFeatureFlags({
        parentChildAccountAccess: makeFeatureFlagData(false),
      });
      mockGetFeatureFlagClientstream();
    });

    /*
     * - Smoke test to confirm that regular users can edit billing information.
     * - Confirms that billing action buttons are enabled and open their respective drawers on click.
     * - Confirms that payment method action menu items are enabled.
     */
    it('can edit billing information', () => {
      // The flow prior to Parent/Child does not account for user privileges, instead relying
      // on the API to forbid actions when the user does not have the required privileges.
      // Because the API is doing the heavy lifting, we only need to ensure that the billing action
      // buttons behave as expected for this smoke test.
      const mockProfile = profileFactory.build({
        username: randomLabel(),
        restricted: false,
      });

      const mockUser = accountUserFactory.build({
        username: mockProfile.username,
        user_type: 'default',
        restricted: false,
      });

      // Confirm button behavior for regular users.
      mockGetProfile(mockProfile);
      mockGetUser(mockUser);
      cy.visitWithLogin('/account/billing');
      assertEditBillingInfoEnabled();
      assertAddPaymentMethodEnabled();
    });
  });

  describe('Parent/Child feature enabled', () => {
    beforeEach(() => {
      // Mock the Parent/Child feature flag to be enabled.
      // TODO Delete this `beforeEach()` block when Parent/Child launches and flag is removed.
      mockAppendFeatureFlags({
        parentChildAccountAccess: makeFeatureFlagData(true),
      });
      mockGetFeatureFlagClientstream();
    });

    /*
     * - Confirms that users with read-only account access cannot edit billing information.
     * - Confirms UX enhancements are applied when parent/child feature flag is enabled.
     * - Confirms that "Edit" and "Add Payment Method" buttons are disabled and have informational tooltips.
     * - Confirms that clicking "Edit" and "Add Payment Method" does not open their respective drawers when disabled.
     * - Confirms that button tooltip text reflects read-only account access.
     * - Confirms that payment method action menu items are disabled.
     */
    it('cannot edit billing information with read-only account access', () => {
      const mockProfile = profileFactory.build({
        username: randomLabel(),
        restricted: true,
      });

      const mockUser = accountUserFactory.build({
        username: mockProfile.username,
        restricted: true,
        user_type: 'default',
      });

      const mockGrants = grantsFactory.build({
        global: {
          account_access: 'read_only',
        },
      });

      mockGetProfile(mockProfile);
      mockGetProfileGrants(mockGrants);
      mockGetUser(mockUser);
      cy.visitWithLogin('/account/billing');

      assertEditBillingInfoDisabled(restrictedUserTooltip);
      assertAddPaymentMethodDisabled(restrictedUserTooltip);
    });

    /*
     * - Confirms that child users cannot edit billing information.
     * - Confirms that UX enhancements are applied when parent/child feature flag is enabled.
     * - Confirms that "Edit" and "Add Payment Method" buttons are disabled and have informational tooltips.
     * - Confirms that clicking "Edit" and "Add Payment Method" does not open their respective drawers when disabled.
     * - Confirms that button tooltip text reflects child user access.
     * - Confirms that payment method action menu items are disabled.
     */
    it('cannot edit billing information as child account', () => {
      const mockProfile = profileFactory.build({
        username: randomLabel(),
        user_type: 'child',
      });

      const mockUser = accountUserFactory.build({
        username: mockProfile.username,
      });

      mockGetProfile(mockProfile);
      mockGetUser(mockUser);
      cy.visitWithLogin('/account/billing');

      assertEditBillingInfoDisabled(restrictedUserTooltip);
      assertAddPaymentMethodDisabled(restrictedUserTooltip);
    });

    /*
     * - Smoke test to confirm that regular and parent users can edit billing information.
     * - Confirms that billing action buttons are enabled and open their respective drawers on click.
     */
    it('can edit billing information as a regular user and as a parent user', () => {
      const mockProfileRegular = profileFactory.build({
        username: randomLabel(),
        restricted: false,
      });

      const mockUserRegular = accountUserFactory.build({
        username: mockProfileRegular.username,
        user_type: 'default',
        restricted: false,
      });

      const mockProfileParent = profileFactory.build({
        username: randomLabel(),
        restricted: false,
      });

      const mockUserParent = accountUserFactory.build({
        username: mockProfileParent.username,
        user_type: 'parent',
        restricted: false,
      });

      // Confirm button behavior for regular users.
      mockGetProfile(mockProfileRegular);
      mockGetUser(mockUserRegular);
      cy.visitWithLogin('/account/billing');
      cy.findByText(mockProfileRegular.username);
      assertEditBillingInfoEnabled();
      assertAddPaymentMethodEnabled();

      // Confirm button behavior for parent users.
      mockGetProfile(mockProfileParent);
      mockGetUser(mockUserParent);
      cy.visitWithLogin('/account/billing');
      cy.findByText(mockProfileParent.username);
      assertEditBillingInfoEnabled();
      assertAddPaymentMethodEnabled();
    });
  });
});
