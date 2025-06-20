/**
 * @file Integration tests for Cloud Manager account enable Linode Managed flows.
 */

import {
  grantsFactory,
  linodeFactory,
  profileFactory,
} from '@linode/utilities';
import {
  visitUrlWithManagedDisabled,
  visitUrlWithManagedEnabled,
} from 'support/api/managed';
import {
  linodeEnabledMessageText,
  linodeManagedStateMessageText,
} from 'support/constants/account';
import {
  mockEnableLinodeManaged,
  mockEnableLinodeManagedError,
  mockGetAccount,
} from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';

import { accountFactory } from 'src/factories/account';

import type { Linode } from '@linode/api-v4';

describe('Account Linode Managed', () => {
  /*
   * - Confirms that a user can add linode managed from the Account Settings page.
   * - Confirms that user is told about the Managed price.
   * - Confirms that Cloud Manager displays the Managed state.
   */
  it('users can enable Linode Managed', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      restricted: false,
      username: 'mock-user',
    });
    const mockLinodes = new Array(5)
      .fill(null)
      .map((item: null, index: number): Linode => {
        return linodeFactory.build({
          label: `Linode ${index}`,
          region: chooseRegion().id,
        });
      });

    mockGetLinodes(mockLinodes).as('getLinodes');
    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');
    mockEnableLinodeManaged().as('enableLinodeManaged');

    // Navigate to Account Settings page, click "Add Linode Managed" button.
    visitUrlWithManagedDisabled('/account/settings');
    cy.wait(['@getAccount', '@getProfile', '@getLinodes']);

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
            expect(text.trim()).to.equal(
              linodeEnabledMessageText(mockLinodes.length)
            );
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
  it('restricted users cannot enable Managed', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      restricted: true,
      username: 'mock-restricted-user',
    });
    const mockGrants = grantsFactory.build();
    const errorMessage = 'Unauthorized';

    mockGetLinodes([]);
    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');
    mockGetProfileGrants(mockGrants).as('getGrants');
    mockEnableLinodeManagedError(errorMessage, 403).as('enableLinodeManaged');

    // Navigate to Account Settings page, click "Add Linode Managed" button.
    visitUrlWithManagedDisabled('/account/settings');
    cy.wait(['@getAccount', '@getProfile', '@getGrants']);

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
            expect(text.trim()).to.equal(linodeEnabledMessageText(0));
          });
        // Confirm that submit button is enabled.
        ui.button
          .findByTitle('Add Linode Managed')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.wait('@enableLinodeManaged');
        // Confirm that Cloud Manager displays a notice about Linode managed is unauthorized.
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
      restricted: false,
      username: 'mock-user',
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
    cy.url().should('endWith', '/support/tickets/open?dialogOpen=true');

    // Confirm that title and category are related to cancelling Linode Managed.
    cy.findByLabelText('Title (required)').should(
      'have.value',
      'Cancel Linode Managed'
    );

    cy.findByLabelText('What is this regarding?').should(
      'have.value',
      'General/Account/Billing'
    );
  });
});
