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
import 'cypress-axe';
import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', () => {
  Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test with newrelic errors
    return false;
  });

  cy.clearCookies();
  cy.clearLocalStorage();
  try {
    cy.request({ url: '/logout' });
    cy.request({ url: Cypress.env('loginUrl') });
    cy.log('logged out');
  } catch (err) {
    cy.log('Could not log out');
  }
  let options = {
    url: Cypress.env('loginUrl'),
    body: {
      client_id: Cypress.env('clientId'),
      response_type: `token`,
      scope: '*',
      redirect_uri: Cypress.env('baseUrl')
    }
  };
  cy.request(options).then(resp => {
    expect(resp.status).equals(200);
    const xmlResp = Cypress.$.parseHTML(resp.body);
    cy.log(resp.body);
    const csrfToken = Cypress.$(xmlResp)
      .find('#csrf_token')
      .attr('value');
    const options = {
      method: 'POST',
      url: Cypress.env('loginUrl'),
      form: true,
      body: {
        username: Cypress.env('username'),
        password: Cypress.env('password'),
        csrf_token: csrfToken
      }
    };

    cy.request(options).then(resp => {
      cy.log(resp);
      expect(resp.status).equals(200);
      // cy.visit('/');
    });
  });
});

Cypress.Commands.add('login2', () => {
  Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test with newrelic errors
    return false;
  });
  cy.visit('/null');
  window.localStorage.setItem(
    'authentication/oauth-token',
    Cypress.env('oauthtoken')
  );
  window.localStorage.setItem('authentication/scopes', '*');
  cy.log(window.localStorage.getItem('authentication/oauth-token'));
  window.localStorage.setItem(
    'authentication/expires',
    '2020-04-10T15:10:16.295Z'
  );
  //window.localStorage.setItem('authentication/latest-refresh', '1553782241459');
  window.localStorage.setItem(
    'authentication/expire-datetime',
    'Fri Mar 13 2020 11:36:50 GMT-0400 (Eastern Daylight Time)'
  );
  window.localStorage.setItem(
    'authentication/token',
    'Bearer ' + Cypress.env('oauthtoken')
  );
  // window.localStorage.setItem(
  //   'authentication/nonce',
  //   'd660f305-25c6-42e1-99ab-91fd04dad159'
  // );
  window.localStorage.setItem(
    'authentication/expire',
    'Fri Mar 13 2020 11:54:07 GMT-0500 (Eastern Standard Time)'
  );
});
