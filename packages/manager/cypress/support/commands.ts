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
 * Describes an object which can contain a label.
 */
export interface Labelable {
  label: string;
}

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
  { prevSubject: false },
  <T>(
    promise: Promise<T>,
    options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Labelable>
  ) => {
    const commandLog = Cypress.log({
      name: 'defer',
      message: options?.label ?? 'Resolving Promise',
      autoEnd: false,
      end: false,
    });

    const wrapOptions = {
      ...(options ?? {}),
      log: false,
    };

    // Wraps the given promise in order to update Cypress's log on completion.
    const wrapPromise = async (): Promise<T> => {
      let result: T;
      try {
        result = await promise;
      } catch (e) {
        commandLog.end();
        throw e;
      }
      commandLog.end();
      return result;
    };

    return cy.wrap<Promise<T>, T>(wrapPromise(), wrapOptions);
  }
);

import '@testing-library/cypress/add-commands';
