import { grantsFactory, profileFactory } from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
import { longviewEmptyStateMessage } from 'support/constants/longview';
import { mockGetUser } from 'support/intercepts/account';
import {
  mockGetLongviewClients,
  mockGetLongviewPlan,
  mockUnauthorizedLongviewPlanRequest,
  mockUpdateLongviewPlan,
} from 'support/intercepts/longview';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { randomLabel } from 'support/util/random';

import { accountUserFactory } from 'src/factories';
import { longviewActivePlanFactory } from 'src/factories';

import type { ActiveLongviewPlan } from '@linode/api-v4';

authenticate();
describe('longview plan', () => {
  before(() => {
    cleanUp(['linodes', 'longview-clients']);
  });

  /*
   * - Tests Longview change plan end-to-end using mock API data.
   * - Confirm UI flow when a user changes their Longview plan.
   */
  it('can change longview plan', () => {
    const newPlan: ActiveLongviewPlan = longviewActivePlanFactory.build();

    mockGetLongviewPlan({}).as('getLongviewPlan');

    cy.visitWithLogin('/longview');
    cy.wait('@getLongviewPlan');

    // Confirms that Longview Plan Details tab is visible on the page.
    cy.findByText('Plan Details').should('be.visible').click();

    // Confirms that Longview current plan is visible and enabled by default.
    cy.findByTestId('lv-sub-radio-longview-free').should('be.enabled');
    cy.findByTestId('current-plan-longview-free').should('be.visible');
    ui.button
      .findByTitle('Change Plan')
      .should('be.visible')
      .should('be.disabled');

    mockUpdateLongviewPlan(newPlan).as('updateLongviewPlan');

    // Confirms that Longview plan can be changed.
    cy.findByTestId('lv-sub-table-row-longview-3').click();
    ui.button
      .findByTitle('Change Plan')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirms the Longview plan details shown correctly after plan changed
    cy.wait('@updateLongviewPlan');
    cy.findByText('Plan updated successfully.').should('be.visible');
    cy.findByTestId('lv-sub-table-row-longview-3').should('be.enabled');
    cy.findByTestId('current-plan-longview-3').should('be.visible');
    ui.button
      .findByTitle('Change Plan')
      .should('be.visible')
      .should('be.disabled');
  });
});

describe('restricted user does not have permission to create plan', () => {
  before(() => {
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
        add_longview: false,
        longview_subscription: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);
  });

  /*
   * - Verifies restricted user cannot view or edit plans
   */
  it('restricted user cannot create plan on empty landing page', () => {
    mockGetLongviewClients([]).as('getLongviewClients');
    mockUnauthorizedLongviewPlanRequest().as('getLongviewPlan');
    cy.visitWithLogin('/longview');
    cy.wait(['@getLongviewClients', '@getLongviewPlan']);
    // Confirm that the "Add Client" button is disabled
    ui.button
      .findByTitle('Add Client')
      .should('be.visible')
      .should('be.disabled')
      .trigger('mouseover');
    ui.tooltip.findByText(
      `You don't have permissions to create Longview Clients. Please contact your account administrator to request the necessary permissions.`
    );

    // Confirms that a landing page empty state message is displayed
    cy.findByText(longviewEmptyStateMessage).should('be.visible');

    ui.tabList.findTabByTitle('Plan Details').should('be.visible').click();
    ui.tabList.findTabByTitle('Plan Details').within(() => {
      cy.get('table').should('not.exist');
      cy.get('imput').should('not.exist');
    });
  });
});
