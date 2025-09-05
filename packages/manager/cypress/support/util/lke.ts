import { sortByVersion } from '@linode/utilities';
import { ui } from 'support/ui';

import { randomNumber } from './random';

/**
 * Returns the string of the highest semantic version.
 */
export const getLatestKubernetesVersion = (versions: string[]) => {
  const sortedVersions = versions.sort((a, b) => {
    return sortByVersion(a, b, 'asc');
  });

  const latestVersion = sortedVersions.pop();

  if (!latestVersion) {
    // Return an empty string if sorting does not yield latest version
    return '';
  }
  return latestVersion;
};

/**
 * Performs a click operation on Cypress subject a given number of times.
 *
 * @param subject - Cypress subject to click.
 * @param count - Number of times to perform click.
 *
 * @returns Cypress chainable.
 */
const multipleClick = (
  subject: Cypress.Chainable,
  count: number
): Cypress.Chainable => {
  if (count == 1) {
    return subject.click();
  }
  return multipleClick(subject.click(), count - 1);
};

/**
 * Adds a random-sized node pool of the given plan.
 *
 * @param plan Name of plan for which to add nodes.
 */
export const addNodes = (plan: string) => {
  const defaultNodes = 3;
  const extraNodes = randomNumber(1, 5);

  cy.get(`[data-qa-plan-row="${plan}"`).within(() => {
    multipleClick(cy.get('[data-testid="increment-button"]'), extraNodes);
    multipleClick(cy.get('[data-testid="decrement-button"]'), extraNodes + 1);

    cy.get('[data-testid="textfield-input"]')
      .invoke('val')
      .should('eq', `${defaultNodes - 1}`);

    ui.button
      .findByTitle('Add')
      .should('be.visible')
      .should('be.enabled')
      .click();
  });
};
