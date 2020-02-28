import strings from '../support/cypresshelpers';
import '@testing-library/cypress/add-commands';

const testLinodeNamePreffix = 'cy-test-';


describe('cypress e2e poc', () => {
  beforeEach(() => {
    cy.login2();
  });

  it('creates a nanode', () => {
    const rootpass = strings.randomPass();
    cy.visit('/linodes/create');
    cy.get('[data-testid="link-text"]').should('have.text', 'linodes');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    cy.contains('Regions')
      .click()
      .type('new {enter}');
    cy.contains('Nanode').click();
    cy.get('[data-qa-plan-row="Nanode 1GB"]').click();
    cy.get('#linode-label')
      .click()
      .clear()
      .type(testLinodeNamePreffix+strings.randomTitle(6));
    cy.get('#root-password').type(rootpass);
    cy.get('[data-qa-deploy-linode]').click();
    cy.get('[data-qa-power-control="Busy"]').should('be.visible');
    // skipping this step to save time as we are not currently looking to test the
    // systems side of things
    // cy.get('[data-qa-power-control="Running"]', { timeout: 120000 }).should(
    //   'be.visible'
    // );
  });


  it('deletes test nanode',()=>{

    cy.server()
    cy.route(
      {
        method:"DELETE",
        url: '*/linode/instances/*'
      }
    ).as('deleteLinode');

      cy.visit('/linodes');
      /** Here we cannot factorixe the result of the selector
       *  in a variable as this is a chain of action and not an element
       *  Solution is to write the selector as a function if we want to factorize code
       */
      const testLinode = ()=>cy.findAllByText(testLinodeNamePreffix,{exact:false}).first();
      testLinode().invoke('text').then($linodeName =>{
        testLinode().click();

        cy.url().should('contain','/summary');
        cy.findByText($linodeName).should('exist');
        cy.findByText('Settings').click();
        cy.findByText('Delete Linode').click();

        // here i query using text to check the UI and there is only 1 Delete button
        // cy.get('[data-qa-delete-linode]').click();
        cy.findByText('Delete').click();
        cy.findByText($linodeName).should('exist');
        
        // confirm delete
        // there is now 2 delete on the page so i use the attribute selector
        // cy.findByText('Delete').debug()
        cy.get('[data-qa-confirm-delete]').click();
        // Here if the request is against a local route 
        // this is because we use a proxy in webpack config
        // this redirects localhost:3000/api to api.linode.com/api
        // Thanks to this we can use cy.server, cy.route and cy.wait
        cy.wait('@deleteLinode').its('status').should('be',200);
        cy.url().should('contain','/linodes');
        cy.go('back');
        cy.findByText('Not found');
      });
    
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
