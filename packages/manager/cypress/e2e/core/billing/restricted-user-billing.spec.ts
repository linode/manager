/**
 * @file Integration tests for restricted user billing flows.
 */

import { grantsFactory, profileFactory } from '@linode/utilities';
import { paymentMethodFactory } from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { mockGetPaymentMethods, mockGetUser } from 'support/intercepts/account';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

import { ADMINISTRATOR, PARENT_USER } from 'src/features/Account/constants';

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

/**
 * Asserts that the "Make a Payment" button is disabled.
 *
 * Additionally confirms that clicking the "Make a Payment" button reveals
 * a tooltip and does not open the "Make a Payment" drawer.
 *
 * @param tooltipText - Expected tooltip message to be shown to the user.
 */
const assertMakeAPaymentDisabled = (tooltipText: string) => {
  // Confirm "Make A Payment" button is disabled, then click it.
  ui.button
    .findByTitle('Make a Payment')
    .should('be.visible')
    .should('be.disabled')
    .click();

  // Assert that "Make a Payment" drawer does not open and that tooltip is revealed.
  cy.get(`[data-qa-drawer-title="Make a Payment"]`).should('not.exist');
  ui.tooltip.findByText(tooltipText).should('be.visible');
};

/**
 * Asserts that the "Make a Payment" button is enabled.
 *
 * Additionally confirms that clicking the "Make a Payment" button reveals
 * a tooltip and does not open the "Make a Payment" drawer.
 *
 * @param tooltipText - Expected tooltip message to be shown to the user.
 */
const assertMakeAPaymentEnabled = () => {
  // Confirm "Make A Payment" button is enabled, then click it.
  ui.button
    .findByTitle('Make a Payment')
    .should('be.visible')
    .should('be.enabled')
    .click();

  cy.get(`[data-qa-drawer-title="Make a Payment"]`).should('be.visible');
  ui.drawer
    .findByTitle('Make a Payment')
    .should('be.visible')
    .within(() => {
      ui.button
        .findByTitle('Pay Now')
        .should('be.visible')
        .should('be.enabled');
      ui.drawerCloseButton.find().click();
    });
};

describe('restricted user billing flows', () => {
  beforeEach(() => {
    mockGetPaymentMethods(mockPaymentMethods);
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
      restricted: true,
      username: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      restricted: true,
      user_type: 'default',
      username: mockProfile.username,
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
    assertMakeAPaymentDisabled(
      restrictedUserTooltip +
        ` Please contact your ${ADMINISTRATOR} to request the necessary permissions.`
    );
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
      user_type: 'child',
      username: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      username: mockProfile.username,
    });

    mockGetProfile(mockProfile);
    mockGetUser(mockUser);
    cy.visitWithLogin('/account/billing');

    assertEditBillingInfoDisabled(restrictedUserTooltip);
    assertAddPaymentMethodDisabled(restrictedUserTooltip);
    assertMakeAPaymentDisabled(
      restrictedUserTooltip +
        ` Please contact your ${PARENT_USER} to request the necessary permissions.`
    );
  });

  /*
   * - Smoke test to confirm that regular and parent users can edit billing information.
   * - Confirms that billing action buttons are enabled and open their respective drawers on click.
   */
  it('can edit billing information as a regular user and as a parent user', () => {
    const mockProfileRegular = profileFactory.build({
      restricted: false,
      username: randomLabel(),
    });

    const mockUserRegular = accountUserFactory.build({
      restricted: false,
      user_type: 'default',
      username: mockProfileRegular.username,
    });

    const mockProfileParent = profileFactory.build({
      restricted: false,
      username: randomLabel(),
    });

    const mockUserParent = accountUserFactory.build({
      restricted: false,
      user_type: 'parent',
      username: mockProfileParent.username,
    });

    // Confirm button behavior for regular users.
    mockGetProfile(mockProfileRegular);
    mockGetUser(mockUserRegular);
    cy.visitWithLogin('/account/billing');
    cy.findByText(mockProfileRegular.username);
    assertEditBillingInfoEnabled();
    assertAddPaymentMethodEnabled();
    assertMakeAPaymentEnabled();

    // Confirm button behavior for parent users.
    mockGetProfile(mockProfileParent);
    mockGetUser(mockUserParent);
    cy.visitWithLogin('/account/billing');
    cy.findByText(mockProfileParent.username);
    assertEditBillingInfoEnabled();
    assertAddPaymentMethodEnabled();
    assertMakeAPaymentEnabled();
  });
});
