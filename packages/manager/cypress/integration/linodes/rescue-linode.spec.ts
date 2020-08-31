import {
  createLinode,
  deleteLinodeById,
  clickLinodeActionMenu
} from '../../support/api/linodes';
import { assertToast } from '../../support/ui/events';

const rebootInRescueMode = () => {
  cy.findByText('Reboot into Rescue Mode').click();
};

describe('rescue linode', () => {
  it('rescue a linode', () => {
    cy.visitWithLogin('/support');
    createLinode().then(linode => {
      cy.server();
      // mock 200 response
      cy.route({
        method: 'POST',
        url: `*/linode/instances/${linode.id}/rescue`,
        response: {}
      }).as('postRebootInRescueMode');
      const rescueUrl = `/linodes/${linode.id}`;
      cy.visit(rescueUrl);
      clickLinodeActionMenu(linode.label);
      cy.get('[data-qa-action-menu-item="Rescue"]:visible')
        .should('be.visible')
        .click();
      rebootInRescueMode();
      // check mocked response and make sure UI responded correctly
      cy.route({
        url: `*/account/events**`,
        method: 'GET',
        response: {
          results: 0,
          data: []
        }
      });
      cy.wait('@postRebootInRescueMode')
        .its('status')
        .should('eq', 200);
      assertToast('Linode rescue started.');
      deleteLinodeById(linode.id);
    });
  });

  it('rescue blocked', () => {
    cy.visitWithLogin('/support');
    createLinode().then(linode => {
      cy.server();
      cy.route({
        url: `*/account/events**`,
        method: 'GET',
        response: {
          results: 0,
          data: []
        }
      });
      // not mocking response here
      cy.route({
        method: 'POST',
        url: `*/linode/instances/${linode.id}/rescue`
      }).as('postRebootInRescueMode');
      const rescueUrl = `/linodes/${linode.id}/rescue`;
      cy.visit(rescueUrl);
      clickLinodeActionMenu(linode.label);
      cy.get('[data-qa-action-menu-item="Rescue"]:visible')
        .should('be.visible')
        .click();
      rebootInRescueMode();
      // check response, verify bad request and UI response (toast)
      cy.wait('@postRebootInRescueMode')
        .its('status')
        .should('eq', 400);
      cy.findByText('Linode busy.');
      deleteLinodeById(linode.id);
    });
  });
});
