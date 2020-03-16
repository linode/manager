
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
  const expireDate = Cypress.moment().add(30, 'days');
  const isoExpire = expireDate.toISOString();
  cy.log(isoExpire);
  window.localStorage.setItem('authentication/expires', isoExpire);

  window.localStorage.setItem(
    'authentication/expire-datetime',
    isoExpire
  );
  window.localStorage.setItem(
    'authentication/token',
    'Bearer ' + Cypress.env('oauthtoken')
  );
  window.localStorage.setItem(
    'authentication/expire',
    isoExpire
  );
});
