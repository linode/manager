import { authenticate } from 'support/api/authentication';
import {
  mockGetLongviewPlan,
  mockUpdateLongviewPlan,
} from 'support/intercepts/longview';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';

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
