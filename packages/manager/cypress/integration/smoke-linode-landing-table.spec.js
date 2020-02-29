// import '@testing-library/cypress/add-commands';


describe('linode landing', () => {
  beforeEach(() => {
    cy.login2();
  });
  it.skip('show-all-linode',()=>{
    cy.visit('/linodes');
    // Does not work because of MUI select
    //    cy.get('#number-of-items-to-show')
      // .select('Show All')
    // cy.get('[data-qa-enhanced-select]')
    //   .click()
      // .findByText('Show All')
      // .click()

  });
});
