Cypress.Commands.add('loginWithUsername', () => {
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
    });
  });
});

const _loginWithToken = win => {
  win.localStorage.setItem(
    'authentication/oauth-token',
    Cypress.env('oauthtoken')
  );
  win.localStorage.setItem('authentication/scopes', '*');
  // cy.log(window.localStorage.getItem('authentication/oauth-token'));
  const expireDate = Cypress.moment().add(30, 'days');
  const isoExpire = expireDate.toISOString();
  // cy.log(isoExpire);
  win.localStorage.setItem('authentication/expires', isoExpire);
  win.localStorage.setItem('authentication/expire-datetime', isoExpire);
  win.localStorage.setItem(
    'authentication/token',
    'Bearer ' + Cypress.env('oauthtoken')
  );
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
