import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

describe('Quotas inaccessible when limitsEvolution feature flag disabled', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      limitsEvolution: {
        enabled: false,
      },
    }).as('getFeatureFlags');
  });

  it('Quotas page is inaccessible', () => {
    cy.visitWithLogin('/quotas');
    cy.wait('@getFeatureFlags');
    cy.findByText('Not Found').should('be.visible');
    cy.findByText('This page does not exist.').should('be.visible');
  });

  it('Cannot navigate to the Quotas tab via the user menu', () => {
    cy.visitWithLogin('/');
    cy.wait('@getFeatureFlags');
    // Open user menu
    ui.userMenuButton.find().click();
    ui.userMenu.find().within(() => {
      cy.findByText('Quotas').should('not.exist');
    });
  });
});
