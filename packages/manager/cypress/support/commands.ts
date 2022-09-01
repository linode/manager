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
 * Returns a Cypress Promise that can be used in place of the given Promise.
 *
 * @param {Promise<any>} promise - Promise with result to await.
 *
 * @returns {any} Promise result.
 */
Cypress.Commands.add('defer', (promise: Promise<any>) => {
  return new Cypress.Promise((resolve, reject) => {
    promise
      .then((...data) => {
        resolve(...data);
      })
      .catch((...data) => {
        reject(...data);
      });
  });
});

import '@testing-library/cypress/add-commands';
