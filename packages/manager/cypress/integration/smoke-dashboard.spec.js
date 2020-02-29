

describe('dashboard', () => {
  beforeEach(() => {
    cy.login2();
  });

  it('checks the dashboard page', () => {
    cy.visit('/');
    cy.get('[data-qa-header]').should('have.text', 'Dashboard');
    cy.get('[data-qa-card="Linodes"] h2').should('have.text', 'Linodes');
    cy.get('[data-qa-card="Volumes"] h2').should('have.text', 'Volumes');
    cy.get('[data-qa-card="Domains"] h2').should('have.text', 'Domains');
    cy.get('[data-qa-card="NodeBalancers"] h2').should(
      'have.text',
      'NodeBalancers'
    );
  });
  it.only('checks load time and nb of GET', ()=>{
    let xhrData = []
    cy.wrap(xhrData).as('xhrData');
    cy.server({
      // Here we handle all requests passing through Cypress' server
      onRequest: (req) => {
          console.log(xhrData)
          xhrData.push(req);

      },
    })
    cy.route({
      method:'GET',
      url:'/v4/*'
    }).as('apiGet');

    const MAX_LOAD_TIME_MS = 3000;
    const MAX_GET_REQ_TO_API = 8;
    cy.visit('/');
    cy.get('[data-qa-header]').should('have.text', 'Dashboard');
    cy.get('[data-qa-card="Linodes"] h2').should('have.text', 'Linodes');
    cy.window().should('exist')
    cy.window().then(win=>cy.wrap(win.performance.now()).should('be.lte',MAX_LOAD_TIME_MS));

    cy.get('@xhrData').its('length').should('be.lte',MAX_GET_REQ_TO_API);

  })
});
