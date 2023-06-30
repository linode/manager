// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import '@testing-library/cypress/add-commands';
import 'cypress-axe';
import './login';

/**
 * Yields a Cypress Promise that can be used in place of the given Promise.
 *
 * @param promise - Promise with result to await.
 * @param options - Defer options.
 *
 * @returns Promise result.
 */
Cypress.Commands.add(
  'defer',
  <T>(
    promise: Promise<T>,
    options?: Partial<Cypress.Loggable & Cypress.Timeoutable>
  ) => {
    return cy.wrap<Promise<T>, T>(promise, options);
  }
);

import '@testing-library/cypress/add-commands';
