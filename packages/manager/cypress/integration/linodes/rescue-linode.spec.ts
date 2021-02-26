import {
  createLinode,
  deleteLinodeById,
  clickLinodeActionMenu,
} from '../../support/api/linodes';
import { fbtClick, fbtVisible, getClick } from '../../support/helpers';
import { assertToast } from '../../support/ui/events';

const rebootInRescueMode = () => {
  fbtClick('Reboot into Rescue Mode');
};

describe('rescue linode', () => {
  it('rescue a linode', () => {
    cy.visitWithLogin('/support');
    createLinode().then(linode => {
      // mock 200 response
      cy.intercept('POST', `*/linode/instances/${linode.id}/rescue`, req => {
        req.reply(200);
      }).as('postRebootInRescueMode');
      const rescueUrl = `/linodes/${linode.id}`;
      cy.visit(rescueUrl);
      clickLinodeActionMenu(linode.label);
      getClick('[data-qa-action-menu-item="Rescue"]:visible');
      rebootInRescueMode();
      // check mocked response and make sure UI responded correctly
      cy.wait('@postRebootInRescueMode')
        .its('response.statusCode')
        .should('eq', 200);
      assertToast('Linode rescue started.');
      deleteLinodeById(linode.id);
    });
  });

  it('rescue blocked', () => {
    cy.visitWithLogin('/support');
    createLinode().then(linode => {
      // not mocking response here, intercepting post
      cy.intercept('POST', `*/linode/instances/${linode.id}/rescue`).as(
        'postRebootInRescueMode'
      );
      const rescueUrl = `/linodes/${linode.id}/rescue`;
      cy.visit(rescueUrl);
      fbtVisible(`Rescue ${linode.label}`);
      rebootInRescueMode();
      // check response, verify bad request and UI response (toast)
      cy.wait('@postRebootInRescueMode')
        .its('response.statusCode')
        .should('eq', 400);
      fbtVisible('Linode busy.');
      deleteLinodeById(linode.id);
    });
  });
});
