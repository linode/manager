/**
 * @file Integration tests for Cloud Manager email bounce banners.
 */

import { Notification } from '@linode/api-v4';
import { notificationFactory } from '@src/factories/notification';
import { mockGetNotifications } from 'support/intercepts/events';
import { getProfile } from 'support/api/account';
import { ui } from 'support/ui';
import { mockUpdateProfile } from 'support/intercepts/profile';
import { randomString } from 'support/util/random';

const notifications_billing_email_bounce: Notification[] = [
  notificationFactory.build({
    type: 'billing_email_bounce',
    severity: 'major',
  }),
];

const notifications_user_email_bounce: Notification[] = [
  notificationFactory.build({
    type: 'user_email_bounce',
    severity: 'major',
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
  it('User profile email bounce is visible and can be updated by users', () => {
    const newEmail = `${randomString(12)}@example.com`;

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
            .findByTitle(updateButton)
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.get('[id="email"]')
        .should('be.visible')
        .should('have.value', userprofileEmail)
        .clear()
        .type(newEmail);

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

      cy.wait('@updateEmail');
      cy.findByText('Email updated successfully.').should('be.visible');
      // email bounce still exist ???
    });
  });

  it.only('Billing email bounce is visible and can be confirmed by users', () => {
    //how to get billing email???
    const BillingEmail = 'azsh@akamai.com';

    const BillingEmailBounceBanner = `An email to your account’s email address couldn’t be delivered. Is ${BillingEmail} the correct address?`;

    mockGetNotifications(notifications_billing_email_bounce).as(
      'mockNotifications'
    );
    cy.visitWithLogin('/account/billing');
    cy.wait('@mockNotifications');

    //mockUpdateAccount(mockAccount).as('AccountBilling');

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

    ui.toast.assertMessage('Email confirmed');

    //cy.wait('@AccountBilling');
    cy.contains(BillingEmailBounceBanner).should('not.exist');
    cy.findByText('Billing Contact')
      .should('be.visible')
      .parent()
      .parent()
      .within(() => {
        cy.findByText(`${BillingEmail}`).should('be.visible');
      });
  });
});
