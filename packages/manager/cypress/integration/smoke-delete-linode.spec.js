import '@testing-library/cypress/add-commands';
import {testLinodeNamePreffix, makeLinodeCreateReq, apiCheckErrors} from './linode-utilities';


describe('delete linode', () => {

  beforeEach(() => {
    cy.login2();
  });
  it('deletes test nanode',()=>{
    cy.visit('/linodes');
    makeLinodeCreateReq().then(resp=>{
      apiCheckErrors(resp);
      console.log(`Created Linode ${resp.body.label} successfully`, resp);
    });
    cy.server()
    cy.route(
      {
        method:"DELETE",
        url: '*/linode/instances/*'
      }
    ).as('deleteLinode');

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
