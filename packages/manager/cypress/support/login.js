const loginUrl = Cypress.env('REACT_APP_LOGIN_ROOT') + '/login';
const oauthtoken = Cypress.env('MANAGER_OAUTH');

const _loginWithToken = win => {
  win.localStorage.setItem('authentication/oauth-token', oauthtoken);
  win.localStorage.setItem('authentication/scopes', '*');
  // cy.log(window.localStorage.getItem('authentication/oauth-token'));
  const expireDate = Cypress.moment().add(30, 'days');
  const isoExpire = expireDate.toISOString();
  // cy.log(isoExpire);
  win.localStorage.setItem('authentication/expires', isoExpire);
  win.localStorage.setItem('authentication/expire-datetime', isoExpire);
  win.localStorage.setItem('authentication/token', 'Bearer ' + oauthtoken);
  win.localStorage.setItem('authentication/expire', isoExpire);
};

Cypress.Commands.add('visitWithLogin', (url, opt) => {
  Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test with newrelic errors
    return false;
  });
  const options = {
    onBeforeLoad: win => {
      _loginWithToken(win);
    }
  };
  console.log('executing visit');
  return cy.visit(url, { ...opt, ...options });
});
