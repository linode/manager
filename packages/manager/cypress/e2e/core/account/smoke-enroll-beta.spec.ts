import { accountBetaFactory, betaFactory } from '@linode/utilities';
import { DateTime } from 'luxon';
import { authenticate } from 'support/api/authentication';
import {
  mockGetAccountBetas,
  mockGetBeta,
  mockGetBetas,
  mockPostBeta,
} from 'support/intercepts/betas';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';

authenticate();

beforeEach(() => {
  cy.tag('method:e2e');
});

describe('Enroll in a Beta Program', () => {
  it('checks the Beta Programs page', () => {
    mockAppendFeatureFlags({
      selfServeBetas: true,
    }).as('getFeatureFlags');
    const currentlyEnrolledBeta = accountBetaFactory.build({
      enrolled: DateTime.now().minus({ days: 10 }).toISO(),
      id: '12345',
      started: DateTime.now().minus({ days: 11 }).toISO(),
    });
    const availableBetas = betaFactory.buildList(2);
    const historicalBetas = accountBetaFactory.buildList(2, {
      ended: DateTime.now().minus({ days: 5 }).toISO(),
      enrolled: DateTime.now().minus({ days: 10 }).toISO(),
      id: '1234',
      label: 'Historical Beta',
      started: DateTime.now().minus({ days: 15 }).toISO(),
    });

    const accountBetas = [currentlyEnrolledBeta, ...historicalBetas];

    mockGetAccountBetas(accountBetas).as('getAccountBetas');
    mockGetBetas(availableBetas).as('getBetas');
    mockGetBeta(availableBetas[0]).as('getBeta');
    mockPostBeta(availableBetas[0]).as('postBeta');

    cy.visitWithLogin('/betas');
    cy.wait('@getBetas');
    cy.wait('@getAccountBetas');

    cy.get('[data-qa-beta-details="enrolled-beta"]').should('have.length', 1);
    cy.get('[data-qa-beta-details="available-beta"]').should('have.length', 2);
    cy.get('[data-qa-beta-details="historical-beta"]').should('have.length', 1);

    cy.get('[data-qa-beta-details="available-beta"]')
      .first()
      .within(() => {
        cy.get('button').click();
      });
    cy.wait('@getBeta');

    cy.url().should('include', '/betas/signup/beta-1');
    cy.findByRole('button', { name: 'Sign Up' }).should('be.disabled');
    cy.findByText('I agree to the terms').click();
    cy.findByRole('button', { name: 'Sign Up' }).should('be.enabled').click();

    cy.wait('@postBeta');
    cy.url().should('include', '/betas');
    cy.url().should('not.include', 'signup');
  });
});
