import { mockGetStreams } from 'support/intercepts/delivery';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

describe('Streams empty landing page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclpLogs: {
        enabled: true,
        beta: true,
      },
    });
  });

  it('shows the empty state when there are no streams', () => {
    mockGetStreams([]).as('getStreams');

    cy.visitWithLogin('/logs/delivery/streams');
    cy.wait(['@getStreams']);

    // Empty state message is displayed when no streams exist
    cy.findByText(
      'Create a stream and configure delivery of cloud logs'
    ).should('be.visible');

    // Click the Create Stream button and verify navigation to the stream creation page
    ui.button
      .findByTitle('Create Stream')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/logs/delivery/streams/create');
  });
});
