import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

describe('Quotas accessible when limitsEvolution feature flag enabled', () => {
  // TODO M3-10491 - Remove `describe` block and move tests to parent scope once `iamRbacPrimaryNavChanges` feature flag is removed.
  describe('When IAM RBAC account navigation feature flag is enabled', () => {
    beforeEach(() => {
      // TODO M3-10003 - Remove mock once `limitsEvolution` feature flag is removed.
      mockAppendFeatureFlags({
        limitsEvolution: {
          enabled: true,
        },
        // TODO M3-10491 - Remove `iamRbacPrimaryNavChanges` mock once feature flag is removed.
        iamRbacPrimaryNavChanges: true,
      }).as('getFeatureFlags');
    });

    it('can navigate directly to Quotas page', () => {
      cy.visitWithLogin('/quotas');
      cy.wait('@getFeatureFlags');
      cy.url().should('endWith', '/quotas');
      cy.contains(
        'View your Object Storage quotas by applying the endpoint filter below'
      ).should('be.visible');
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
  });

  // TODO M3-10491 - Remove `describe` block and tests once "iamRbacPrimaryNavChanges" feature flag is removed.
  describe('When IAM RBAC account navigation feature flag is disabled', () => {
    beforeEach(() => {
      mockAppendFeatureFlags({
        limitsEvolution: {
          enabled: true,
        },
        iamRbacPrimaryNavChanges: false,
      }).as('getFeatureFlags');
    });

    it('can navigate directly to Quotas page', () => {
      cy.visitWithLogin('/account/quotas');
      cy.wait('@getFeatureFlags');
      cy.url().should('endWith', '/account/quotas');
      cy.contains(
        'View your Object Storage quotas by applying the endpoint filter below'
      ).should('be.visible');
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
});

describe('Quotas inaccessible when limitsEvolution feature flag disabled', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      limitsEvolution: {
        enabled: false,
      },
      iamRbacPrimaryNavChanges: true,
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
