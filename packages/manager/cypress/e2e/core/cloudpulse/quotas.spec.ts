import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

describe('Quotas accessible when limitsEvolution feature flag enabled', () => {
  beforeEach(() => {
    // TODO M3-10003 - Remove mock once `limitsEvolution` feature flag is removed.
    mockAppendFeatureFlags({
      limitsEvolution: {
        enabled: true,
      },
    }).as('getFeatureFlags');
  });
  it('can navigate directly to Quotas page', () => {
    cy.visitWithLogin('/account/quotas');
    cy.wait('@getFeatureFlags');
    cy.url().should('endWith', '/quotas');
    cy.findByText('Object Storage').should('be.visible');
  });

  it('can navigate to the Quotas page via the User Menu', () => {
    cy.visitWithLogin('/');
    cy.wait('@getFeatureFlags');
    // Open user menu
    ui.userMenuButton.find().click();
    ui.userMenu.find().within(() => {
      cy.get('[data-testid="menu-item-Quotas"]').should('be.visible').click();
      cy.url().should('endWith', '/quotas');
    });
  });

  it('Quotas tab is visible from all other tabs in Account tablist', () => {
    cy.visitWithLogin('/account/billing');
    cy.wait('@getFeatureFlags');
    ui.tabList.find().within(() => {
      cy.get('a').each(($link) => {
        cy.wrap($link).click();
        cy.get('[data-testid="Quotas"]').should('be.visible');
      });
    });
    cy.get('[data-testid="Quotas"]').should('be.visible').click();
    cy.url().should('endWith', '/quotas');
  });
});

describe('Quotas inaccessible when limitsEvolution feature flag disabled', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      limitsEvolution: {
        enabled: false,
      },
    }).as('getFeatureFlags');
  });
  it('Quotas page is inaccessible', () => {
    cy.visitWithLogin('/account/quotas');
    cy.wait('@getFeatureFlags');
    cy.url().should('endWith', '/billing');
  });

  it('cannot navigate to the Quotas tab via the Users & Grants link in the User Menu', () => {
    cy.visitWithLogin('/');
    cy.wait('@getFeatureFlags');
    // Open user menu
    ui.userMenuButton.find().click();
    ui.userMenu.find().within(() => {
      cy.get('[data-testid="menu-item-Quotas"]').should('not.exist');
      cy.get('[data-testid="menu-item-Users & Grants"]')
        .should('be.visible')
        .click();
    });
    cy.url().should('endWith', '/users');
    cy.get('[data-testid="Quotas"]').should('not.exist');
  });

  it('cannot navigate to the Quotas tab via the Billing link in the User Menu', () => {
    cy.visitWithLogin('/');
    cy.wait('@getFeatureFlags');
    ui.userMenuButton.find().click();
    ui.userMenu.find().within(() => {
      cy.get('[data-testid="menu-item-Quotas"]').should('not.exist');
      cy.get('[data-testid="menu-item-Billing & Contact Information"]')
        .should('be.visible')
        .click();
    });
    cy.url().should('endWith', '/billing');
    cy.get('[data-testid="Quotas"]').should('not.exist');
  });
});
