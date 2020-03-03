import '@testing-library/cypress/add-commands';
import { createLinode, deleteLinodeById } from '../../support/api/linodes';
import { getLinodeLandingRow } from '../../support/ui/linodes';


describe('linode landing', () => {
  beforeEach(() => {
    cy.login2();
  });

  it('show-all-linode', () => {
    cy.visit('/linodes');
    // Does not work because of MUI select
    //    cy.get('#number-of-items-to-show')
    // .select('Show All')
    cy.get('[data-qa-enhanced-select]').click();
    cy.findByText('Show All').click();
  });
  it.only('linode row menu', () => {
    createLinode().then(linode => {
      cy.visit('/linodes');
      getLinodeLandingRow(linode.label).within($el => {
        cy.get(`[data-qa-action-menu]`).should('exist');
      });

      deleteLinodeById(linode.id);
    });
  });
});
