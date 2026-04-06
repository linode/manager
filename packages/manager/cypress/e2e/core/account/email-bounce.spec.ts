/**
 * @file Integration tests for Cloud Manager email bounce banners.
 */

import { notificationFactory } from '@src/factories/notification';
import { getProfile } from 'support/api/account';
import { mockGetAccount, mockUpdateAccount } from 'support/intercepts/account';
import { mockGetNotifications } from 'support/intercepts/events';
import { mockUpdateProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomString } from 'support/util/random';

import { accountFactory } from 'src/factories/account';

import type { Notification } from '@linode/api-v4';

const notifications_billing_email_bounce: Notification[] = [
  notificationFactory.build({
    severity: 'major',
    type: 'billing_email_bounce',
  }),
];

const notifications_user_email_bounce: Notification[] = [
  notificationFactory.build({
    severity: 'major',
    type: 'user_email_bounce',
  }),
];

const confirmButton = 'Yes it’s correct.';
const updateButton = 'No, let’s update it.';

describe('Email bounce banners', () => {
  /*
   * Confirm that the user profile email banner appears when the user_email_bounce notification is present
   * Confirm that clicking "Yes, it's correct" causes a PUT request to be made to the API account endpoint containing the current user profile email address
   */
  it('User profile email bounce is visible and can be confirmed by users', () => {
    getProfile().then((profile) => {
      const userprofileEmail = profile.body.email;

      const UserProfileEmailBounceBanner = `An email to your user profile’s email address couldn’t be delivered. Is ${userprofileEmail} the correct address?`;

      mockGetNotifications(notifications_user_email_bounce).as(
        'mockNotifications'
      );
      cy.visitWithLogin('/account/users');
      cy.wait('@mockNotifications');

      mockUpdateProfile({
        ...profile.body,
        email: userprofileEmail,
      }).as('updateEmail');

      cy.contains(UserProfileEmailBounceBanner)
        .should('be.visible')
        .parent()
        .parent()
        .within(() => {
          ui.button
            .findByTitle(confirmButton)
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      ui.toast.assertMessage('Email confirmed');
      cy.contains(UserProfileEmailBounceBanner).should('not.exist');
      cy.wait('@updateEmail');
      cy.findByText(`${userprofileEmail}`).should('be.visible');
    });
  });

  /*
   * Confirm that the user profile email banner appears when the user_email_bounce notification is present
   * Confirm that clicking "No, let's update it" redirects the user to {{/account} and that the contact info edit drawer is automatically opened
   */
  // TODO unskip the test once M3-8181 is fixed
  it.skip('User profile email bounce is visible and can be updated by users', () => {
    const newEmail = `${randomString(12)}@example.com`;

    getProfile().then((profile) => {
      const userprofileEmail = profile.body.email;

      const UserProfileEmailBounceBanner = `An email to your user profile’s email address couldn’t be delivered. Is ${userprofileEmail} the correct address?`;

      mockGetNotifications(notifications_user_email_bounce).as(
        'mockNotifications'
      );
      cy.visitWithLogin('/account/users');
      cy.wait('@mockNotifications');

      cy.contains(UserProfileEmailBounceBanner)
        .should('be.visible')
        .parent()
        .parent()
        .within(() => {
          ui.button
            .findByTitle(updateButton)
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.get('[id="email"]')
        .should('be.visible')
        .should('have.value', userprofileEmail)
        .clear();
      cy.focused().type(newEmail);

      cy.get('[data-qa-textfield-label="Email"]')
        .parent()
        .parent()
        .parent()
        .within(() => {
          ui.button
            .findByTitle('Update Email')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.findByText('Email updated successfully.').should('be.visible');

      // see M3-8181
      cy.contains(UserProfileEmailBounceBanner).should('not.exist');
    });
  });

  /*
   *   Confirm that the billing email banner appears when the billing_email_bounce notification is present
   *   Confirm that clicking "Yes, it's correct" causes a PUT request to be made to the API account endpoint containing the current billing email address
   */
  it('Billing email bounce is visible and can be confirmed by users', () => {
    const accountData = accountFactory.build();
    // mock the user's account data and confirm that it is displayed correctly upon page load
    mockUpdateAccount(accountData).as('updateAccount');
    // get the user's account data for Cloud to inject the email address into the notification
    mockGetAccount(accountData).as('getAccount');

    const billingemail = accountData.email;
    const BillingEmailBounceBanner = `An email to your account’s email address couldn’t be delivered. Is ${billingemail} the correct address?`;

    mockGetNotifications(notifications_billing_email_bounce).as(
      'mockNotifications'
    );

    cy.visitWithLogin('/account/billing');
    cy.wait(['@mockNotifications', '@getAccount']);

    // check the billing email bounce banner and click the confirm button
    cy.contains(BillingEmailBounceBanner)
      .should('be.visible')
      .parent()
      .parent()
      .within(() => {
        ui.button
          .findByTitle(confirmButton)
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // check the toast notification
    cy.wait('@updateAccount');
    ui.toast.assertMessage('Email confirmed');

    // confirm the billing email bounce banner not exist after clicking the confirm button
    cy.contains(BillingEmailBounceBanner).should('not.exist');

    // confirm the email address is visible in Billing Contact
    cy.findByText('Billing Contact')
      .should('be.visible')
      .parent()
      .parent()
      .within(() => {
        cy.findByText(`${billingemail}`).should('be.visible');
      });
  });

  /*
   *   Confirm that the billing email banner appears when the billing_email_bounce notification is present
   *   Confirm that clicking "No, let's update it" redirects the user to {{/account} and that the contact info edit drawer is automatically opened
   */
  // TODO unskip the test once M3-8181 is fixed
  it.skip('Billing email bounce is visible and can be updated by users', () => {
    const accountData = accountFactory.build();
    // mock the user's account data and confirm that it is displayed correctly upon page load
    mockUpdateAccount(accountData).as('updateAccount');
    // get the user's account data for Cloud to inject the email address into the notification
    mockGetAccount(accountData).as('getAccount');

    const billingemail = accountData.email;
    const BillingEmailBounceBanner = `An email to your account’s email address couldn’t be delivered. Is ${billingemail} the correct address?`;

    mockGetNotifications(notifications_billing_email_bounce).as(
      'mockNotifications'
    );

    cy.visitWithLogin('/account/billing');
    cy.wait(['@mockNotifications', '@getAccount']);

    cy.contains(BillingEmailBounceBanner)
      .should('be.visible')
      .parent()
      .parent()
      .within(() => {
        ui.button
          .findByTitle(updateButton)
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    //  see M3-8181
    cy.contains(BillingEmailBounceBanner).should('not.exist');
  });
});
