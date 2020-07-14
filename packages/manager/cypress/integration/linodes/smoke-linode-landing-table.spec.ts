import { createLinode, deleteLinodeById } from '../../support/api/linodes';
import { getLinodeLandingRow } from '../../support/ui/linodes';

describe('linode landing', () => {
  it('linode row menu', () => {
    createLinode().then(linode => {
      cy.visitWithLogin('/linodes');
      getLinodeLandingRow(linode.label).within(_el => {
        cy.findByText('Details').should('exist');
      });
      deleteLinodeById(linode.id).then(resp => {
        expect(resp.status).to.eq(200);
      });
    });
  });
});
