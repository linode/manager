import { createLinode } from 'support/api/linodes';
import { fbtClick, fbtVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { apiMatcher } from 'support/util/intercepts';

const rebootInRescueMode = () => {
  fbtClick('Reboot into Rescue Mode');
};

describe('rescue linode', () => {
  it('rescue a linode', () => {
    cy.visitWithLogin('/support');
    createLinode().then((linode) => {
      // mock 200 response
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/rescue`),
        (req) => {
          req.reply(200);
        }
      ).as('postRebootInRescueMode');
      const rescueUrl = `/linodes/${linode.id}`;
      cy.visit(rescueUrl);
      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem.findByTitle('Rescue').should('be.visible').click();

      rebootInRescueMode();
      // check mocked response and make sure UI responded correctly
      cy.wait('@postRebootInRescueMode')
        .its('response.statusCode')
        .should('eq', 200);

      ui.toast.assertMessage('Linode rescue started.');
    });
  });

  it('rescue blocked', () => {
    cy.visitWithLogin('/support');
    createLinode().then((linode) => {
      // not mocking response here, intercepting post
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/rescue`)
      ).as('postRebootInRescueMode');
      const rescueUrl = `/linodes/${linode.id}/rescue`;
      cy.visit(rescueUrl);
      fbtVisible(`Rescue Linode ${linode.label}`);
      rebootInRescueMode();
      // check response, verify bad request and UI response (toast)
      cy.wait('@postRebootInRescueMode')
        .its('response.statusCode')
        .should('eq', 400);
      fbtVisible('Linode busy.');
    });
  });
});
