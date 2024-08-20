/**
 * @file Integration tests for Cloud Manager account enable Linode Managed flows.
 */

import { profileFactory } from 'src/factories/profile';
import { accountFactory } from 'src/factories/account';
import {
  mockGetAccount,
  mockEnableLinodeManaged,
  mockEnableLinodeManagedError,
} from 'support/intercepts/account';
import {
  linodeEnabledMessageText,
  linodeManagedStateMessageText,
} from 'support/constants/account';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import {
  visitUrlWithManagedDisabled,
  visitUrlWithManagedEnabled,
} from 'support/api/managed';

describe('Account Linode Managed', () => {
  /*
   * - Confirms that a user can add linode managed from the Account Settings page.
   * - Confirms that user is told about the Managed price.
   * - Confirms that Cloud Manager displays the Managed state.
   */
  it('users can enable Linode Managed', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'mock-user',
      restricted: false,
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');
    mockEnableLinodeManaged().as('enableLinodeManaged');

    // Navigate to Account Settings page, click "Add Linode Managed" button.
    visitUrlWithManagedDisabled('/account/settings');
    cy.wait(['@getAccount', '@getProfile']);

    ui.button
      .findByTitle('Add Linode Managed')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle('Just to confirm...')
      .should('be.visible')
      .within(() => {
        cy.get('h6')
          .invoke('text')
          .then((text) => {
            console.log(`h6 text: ${text.trim()}`);
            expect(text.trim()).to.equal(linodeEnabledMessageText);
          });

        // Confirm that submit button is enabled.
        ui.button
          .findByTitle('Add Linode Managed')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@enableLinodeManaged');

    // Confirm that Cloud Manager displays a notice about Linod managed is enabled.
    cy.findByText(linodeManagedStateMessageText, { exact: false }).should(
      'be.visible'
    );
  });

  /*
   * - Confirms Cloud Manager behavior when a restricted user attempts to enable Linode Managed.
   * - Confirms that API error response message is displayed in confirmation dialog.
   */
  it('restricted users cannot cancel account', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'mock-restricted-user',
      restricted: true,
    });
    const errorMessage = 'Unauthorized';

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');
    mockEnableLinodeManagedError(errorMessage, 403).as('enableLinodeManaged');

    // Navigate to Account Settings page, click "Add Linode Managed" button.
    visitUrlWithManagedDisabled('/account/settings');
    cy.wait(['@getAccount', '@getProfile']);

    ui.button
      .findByTitle('Add Linode Managed')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle('Just to confirm...')
      .should('be.visible')
      .within(() => {
        cy.get('h6')
          .invoke('text')
          .then((text) => {
            console.log(`h6 text: ${text.trim()}`);
            expect(text.trim()).to.equal(linodeEnabledMessageText);
          });

        // Confirm that submit button is enabled.
        ui.button
          .findByTitle('Add Linode Managed')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@enableLinodeManaged');

        // Confirm that Cloud Manager displays a notice about Linod managed is enabled.
        cy.findByText(errorMessage, { exact: false }).should('be.visible');
      });
  });

  /*
   * - Confirms that a user can aonly cancel Linode Managed by opening a support ticket.
   * - Confirms that user will be redirected to the creating support ticket page.
   */
  it('users can only open a support ticket to cancel Linode Managed', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'mock-user',
      restricted: false,
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');

    // Navigate to Account Settings page.
    visitUrlWithManagedEnabled('/account/settings');
    cy.wait(['@getAccount', '@getProfile']);

    // Enable button should not exist for users that already enabled Linode Managed.
    cy.findByText('Add Linode Managed').should('not.exist');
    cy.findByText(linodeManagedStateMessageText, { exact: false }).should(
      'be.visible'
    );

    // Navigate to the 'Open a Support Ticket' page.
    cy.findByText('Support Ticket').should('be.visible').click();
    cy.url().should('endWith', '/support/tickets');

    // Confirm that title and category are related to cancelling Linode Managed.
    cy.get('input[id="title"]')
      .invoke('val')
      .then((title) => {
        expect(title).to.equal('Cancel Linode Managed');
      });
    cy.get('input[role="combobox"]')
      .invoke('val')
      .then((category) => {
        expect(category).to.equal('General/Account/Billing');
      });
  });
});
