/**
 * @file Integration tests for Managed monitors.
 */

import { monitorFactory } from 'src/factories/managed';
import { visitUrlWithManagedEnabled } from 'support/api/managed';
import {
  mockCreateServiceMonitor,
  mockDeleteServiceMonitor,
  mockDisableServiceMonitor,
  mockEnableServiceMonitor,
  mockGetServiceMonitors,
  mockUpdateServiceMonitor,
} from 'support/intercepts/managed';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

// Message that's shown when no Managed service monitors are set up.
const noMonitorsMessage = "You don't have any Monitors on your account.";

describe('Managed Monitors tab', () => {
  /*
   * - Confirms that service monitors are listed under the Monitors tab.
   * - Confirms that service monitor statuses are correctly shown in the list.
   */
  it('shows list of Managed monitors and their status', () => {
    const monitors = [
      monitorFactory.build({ label: 'OK Test Monitor', status: 'ok' }),
      monitorFactory.build({
        label: 'Pending Test Monitor',
        status: 'pending',
      }),
      monitorFactory.build({
        label: 'Problem Test Monitor',
        status: 'problem',
      }),
    ];

    mockGetServiceMonitors(monitors).as('getMonitors');
    visitUrlWithManagedEnabled('/managed/monitors');
    cy.wait('@getMonitors');

    // Confirm that each monitor is listed and shows the correct status.
    [
      { label: 'OK Test Monitor', expectedStatus: 'Verified' },
      { label: 'Pending Test Monitor', expectedStatus: 'Pending' },
      { label: 'Problem Test Monitor', expectedStatus: 'Failed' },
    ].forEach((monitorInfo) => {
      cy.findByText(monitorInfo.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText(monitorInfo.expectedStatus).should('be.visible');
        });
    });
  });

  /**
   * - Confirms UI flow for editing Managed service monitors.
   * - Confirms UI flows for disabling and enabling Managed service monitors.
   * - Confirms that list reflects changes made to Managed service monitors.
   */
  it('can update Managed monitors', () => {
    const originalLabel = 'Original Monitor';
    const newLabel = 'New Monitor';
    const monitorId = 1;
    const monitorMenuLabel = 'Action menu for Monitor New Monitor';

    const originalMonitor = monitorFactory.build({
      id: monitorId,
      body: '200',
      label: originalLabel,
      status: 'ok',
      credentials: [],
    });

    const newMonitor = {
      ...originalMonitor,
      label: newLabel,
    };

    mockGetServiceMonitors([originalMonitor]).as('getMonitors');
    visitUrlWithManagedEnabled('/managed/monitors');
    cy.wait('@getMonitors');

    cy.findByText(originalLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button.findByTitle('Edit').should('be.visible').click();
      });

    ui.drawer
      .findByTitle('Edit Monitor')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Monitor Label').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(newLabel);

        mockUpdateServiceMonitor(1, newMonitor).as('updateMonitor');
        mockGetServiceMonitors([newMonitor]).as('getMonitors');
        ui.button.findByTitle('Save Changes').click();

        cy.wait(['@updateMonitor']);
      });

    // Confirm that monitor label has been updated, then disable the monitor.
    cy.findByText(newLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.actionMenu
          .findByTitle(monitorMenuLabel)
          .should('be.visible')
          .click();
      });

    mockDisableServiceMonitor(monitorId, newMonitor).as('disableMonitor');
    ui.actionMenuItem.findByTitle('Disable').click();

    cy.wait('@disableMonitor');

    // Confirm that monitor has been disabled, then re-enable the monitor.
    ui.toast.assertMessage('Monitor disabled successfully.');
    cy.findByText(newLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Disabled').should('be.visible');
        ui.actionMenu
          .findByTitle(monitorMenuLabel)
          .should('be.visible')
          .click();
      });

    mockEnableServiceMonitor(monitorId, newMonitor).as('enableMonitor');
    ui.actionMenuItem.findByTitle('Enable').click();

    cy.wait('@enableMonitor');

    // Confirm that monitor has been re-enabled.
    ui.toast.assertMessage('Monitor enabled successfully.');
    cy.findByText(newLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Verified').should('be.visible');
      });
  });

  /**
   * - Confirms UI flow for creating Managed service monitors.
   * - Confirms that list shows new Managed service monitors.
   */
  it('can create Managed monitors', () => {
    const monitorLabel = randomLabel();
    const monitorUrl = 'https://www.example.com';
    const newMonitor = monitorFactory.build({
      label: monitorLabel,
      address: monitorUrl,
    });

    mockGetServiceMonitors([]).as('getMonitors');
    mockCreateServiceMonitor(newMonitor).as('createMonitor');
    visitUrlWithManagedEnabled('/managed/monitors');
    cy.wait('@getMonitors');

    // Confirm that no service monitors are listed, click "Add Monitor" button.
    cy.findByText(noMonitorsMessage).should('be.visible');
    ui.button
      .findByTitle('Add Monitor')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm that "Add Monitor" drawer opens, fill out and submit form.
    ui.drawer
      .findByTitle('Add Monitor')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Monitor Label', { exact: false })
          .should('be.visible')
          .click();
        cy.focused().type(monitorLabel);

        // Can't `findByLabelText` because multiple elements with "URL" label exist.
        cy.get('input[name="address"]').should('be.visible').click();
        cy.focused().type(monitorUrl);

        ui.buttonGroup
          .findButtonByTitle('Add Monitor')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that new monitor is listed.
    cy.wait('@createMonitor');
    cy.findByText(monitorLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Pending').should('be.visible');
      });
  });

  /**
   * - Confirms UI flow for deleting a Managed service monitor.
   * - Confirms that service monitor is removed from list upon deletion.
   */
  it('can delete Managed monitors', () => {
    const monitorLabel = randomLabel();
    const monitorUrl = 'https://www.example.com';
    const monitorId = 1;
    const monitorMenuLabel = `Action menu for Monitor ${monitorLabel}`;

    const originalMonitor = monitorFactory.build({
      id: monitorId,
      label: monitorLabel,
      address: monitorUrl,
      status: 'ok',
    });

    mockGetServiceMonitors([originalMonitor]).as('getMonitors');
    mockDeleteServiceMonitor(monitorId).as('deleteMonitor');
    visitUrlWithManagedEnabled('/managed/monitors');
    cy.wait('@getMonitors');

    // Find mocked service monitor and click "Delete" action menu item.
    cy.findByText(monitorLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.actionMenu
          .findByTitle(monitorMenuLabel)
          .should('be.visible')
          .click();
      });

    ui.actionMenuItem.findByTitle('Delete').click();

    // Fill out and submit type-to-confirm.
    ui.dialog
      .findByTitle(`Delete Monitor ${monitorLabel}?`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Monitor Name:').should('be.visible').click();
        cy.focused().type(monitorLabel);

        ui.buttonGroup
          .findButtonByTitle('Delete Monitor')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that service monitor is no longer listed.
    cy.wait('@deleteMonitor');
    cy.findByText(noMonitorsMessage).should('be.visible');
  });
});
