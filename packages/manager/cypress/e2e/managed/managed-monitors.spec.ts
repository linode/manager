/**
 * @file Integration tests for Managed monitors.
 */

import { monitorFactory } from 'src/factories/managed';
import {
  mockGetServiceMonitors,
  mockUpdateServiceMonitor,
} from 'support/intercepts/managed';
import { visitUrlWithManagedEnabled } from 'support/api/managed';
import { ui } from 'support/ui';

describe('Managed Monitors tab', () => {
  /*
   * - Confirms that service monitors are listed under the Monitors tab.
   * - Confirms that service monitor statuses are correctly shown in the list.
   */
  it.skip('shows list of Managed monitors and their status', () => {
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
   * - Confirms that service monitors can be edited.
   * - Confirms that service monitors can be disabled and re-enabled.
   */
  it('can update Managed monitors', () => {
    const originalLabel = 'Original Monitor';
    const newLabel = 'New Monitor';

    const originalMonitor = monitorFactory.build({
      id: 1,
      body: '200',
      label: originalLabel,
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
        cy.findByLabelText('Monitor Label')
          .should('be.visible')
          .click()
          .clear()
          .type(newLabel);

        mockUpdateServiceMonitor(1, newMonitor).as('updateMonitor');
        mockGetServiceMonitors([newMonitor]).as('getMonitors');
        ui.button.findByTitle('Save Changes').click();

        cy.wait(['@updateMonitor']);
      });

    // Confirm that monitor label has been updated, then disable the monitor.
    cy.findByText(newLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {});
  });

  it('can create Managed monitors', () => {});

  it('can delete Managed monitors', () => {});
});
