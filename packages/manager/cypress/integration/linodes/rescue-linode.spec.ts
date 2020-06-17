import { createLinode, deleteLinodeById } from '../../support/api/linodes';
import { assertToast } from '../../support/ui/events';
const rebootInRescueMode = () => {
  cy.findByText('Reboot into Rescue Mode').click();
};
describe('rescue linode', () => {
  it('rescue a linode', () => {
    cy.visitWithLogin('/support');
    createLinode().then(linode => {
      cy.server();
      cy.route({
        method: 'POST',
        url: '*/linode/instances/*/rescue'
      }).as('postRebootInRescueMode');
      const rescueUrl = `/linodes/${linode.id}/rescue`;
      cy.visit(rescueUrl);
      rebootInRescueMode();

      cy.wait('@postRebootInRescueMode')
        .its('status')
        .should('eq', 400);
      assertToast('Linode busy.');
      // wait for booting info
      cy.findByText('Booting', { exact: false });
      cy.get('[data-qa-entity-status="running"]', { timeout: 60000 });

      rebootInRescueMode();
      cy.wait('@postRebootInRescueMode')
        .its('status')
        .should('eq', 200);
      assertToast('Linode rescue started.');
      cy.url().should('endWith', `linodes/${linode.id}/summary`);
      cy.findByText('Rebooting', { exact: false });
      deleteLinodeById(linode.id);
    });
  });
});
