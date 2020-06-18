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
      //mock 200 response
      cy.route({
        method: 'POST',
        url: '*/linode/instances/*/rescue',
        response: {}
      }).as('postRebootInRescueMode');
      const rescueUrl = `/linodes/${linode.id}/rescue`;
      cy.visit(rescueUrl);
      rebootInRescueMode();
      //check mocked response and make sure UI responded correctly
      cy.wait('@postRebootInRescueMode')
        .its('status')
        .should('eq', 200);
      assertToast('Linode rescue started.');
      cy.url().should('endWith', `linodes/${linode.id}/summary`);
      deleteLinodeById(linode.id);
    });
  });

  it('rescue blocked', () => {
    cy.visitWithLogin('/support');
    createLinode().then(linode => {
      cy.server();
      //not mocking response here
      cy.route({
        method: 'POST',
        url: '*/linode/instances/*/rescue'
      }).as('postRebootInRescueMode');
      const rescueUrl = `/linodes/${linode.id}/rescue`;
      cy.visit(rescueUrl);
      rebootInRescueMode();
      //check response, verify bad request and UI response (toast)
      cy.wait('@postRebootInRescueMode')
        .its('status')
        .should('eq', 400);
      assertToast('Linode busy.');
      deleteLinodeById(linode.id);
    });
  });
});
