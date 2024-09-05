/**
 * Intercepts request to metrics requests for a cloud pulse.
 *
 * @returns Cypress chainable.
 */
export const interceptMetricsRequests = () => {
  cy.intercept({
    method: 'POST',
    url: '**/monitor/services/linode/metrics',
  }).as('getMetrics');
  return cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
};
