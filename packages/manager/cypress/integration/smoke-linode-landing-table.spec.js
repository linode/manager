import '@testing-library/cypress/add-commands';
import {createLinode, getTestLinode, deleteTestLinodes} from './linode-utilities';

describe('linode landing', () => {
  beforeEach(() => {
    cy.login2();
    cy.visit('/linodes');
  });
  
  it.skip('show-all-linode',()=>{

    // Does not work because of MUI select
    //    cy.get('#number-of-items-to-show')
      // .select('Show All')
    // cy.get('[data-qa-enhanced-select]')
    //   .click()
      // .findByText('Show All')
      // .click()

  });
  it('linode row menu',()=>{

    createLinode();
    getTestLinode().invoke('text').then($linodeName=>{
      cy.get(`[aria-label=${$linodeName}`).within($el=>{
        cy.get(`[data-qa-action-menu]`).click();
        deleteTestLinodes();
        cy.reload();
      });
    }); 
  });
});
