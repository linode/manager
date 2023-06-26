import {
  mockGetIssues,
  mockGetServiceMonitors,
  mockGetStats,
} from 'support/intercepts/managed';
import { managedIssueFactory, monitorFactory } from 'src/factories/managed';
import { visitUrlWithManagedEnabled } from 'support/api/managed';

describe('Managed Summary tab', () => {
  /**
   * - Confirms that message is shown when all monitored services are up.
   * - Confirms that number of down monitored services is shown when one or more service is down.
   * - Confirms that number of open support tickets is shown.
   */
  it('shows summary of Managed services', () => {
    const upServiceMonitors = monitorFactory.buildList(3, {
      status: 'ok',
    });

    const downServiceMonitors = monitorFactory.buildList(3, {
      status: 'problem',
    });

    mockGetServiceMonitors(upServiceMonitors).as('getMonitors');
    mockGetIssues(managedIssueFactory.buildList(3)).as('getIssues');
    mockGetStats().as('getStats');
    visitUrlWithManagedEnabled('/managed/summary');
    cy.wait(['@getMonitors', '@getIssues', '@getStats']);

    // Confirm that message is shown describing the good monitor state.
    cy.findByText('All monitored services are up').should('be.visible');

    // Confirm that summary of open support ticket issues is shown.
    cy.findByText('3 open support tickets').should('be.visible');

    // Reload with new mocks.
    mockGetServiceMonitors(downServiceMonitors).as('getMonitors');
    mockGetIssues([]).as('getIssues');
    visitUrlWithManagedEnabled('/managed/summary');
    cy.wait(['@getMonitors', '@getIssues']);

    // Confirm that error is shown containing the number of services that are down.
    cy.findByText('3 monitored services are down').should('be.visible');

    // Confirm that message is shown describing no open support tickets.
    cy.findByText('No open support tickets').should('be.visible');
  });
});
