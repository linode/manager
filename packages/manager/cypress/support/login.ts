import { DateTime } from 'luxon';

const oauthtoken = Cypress.env('MANAGER_OAUTH');
const _loginWithToken = (win) => {
  win.localStorage.setItem('authentication/oauth-token', oauthtoken);
  win.localStorage.setItem('authentication/scopes', '*');
  // cy.log(window.localStorage.getItem('authentication/oauth-token'));
  const expireDate = DateTime.local().plus({ days: 30 });
  const isoExpire = expireDate.toISO();
  // cy.log(isoExpire);
  win.localStorage.setItem('authentication/expires', isoExpire);
  win.localStorage.setItem('authentication/expire-datetime', isoExpire);
  win.localStorage.setItem('authentication/token', 'Bearer ' + oauthtoken);
  win.localStorage.setItem('authentication/expire', isoExpire);
};

Cypress.Commands.add('visitWithLogin', (url, options) => {
  // returning false here prevents Cypress from
  // failing the test with newrelic errors
  Cypress.on('uncaught:exception', (_err, _runnable) => false);
  const opt = {
    onBeforeLoad: (win) => {
      _loginWithToken(win);
    },
  };
  console.log('executing visit');
  return cy.visit(url, { ...options, ...opt });
});
