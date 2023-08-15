import { authenticate } from 'support/api/authentication';
import { stackScriptFactory } from 'src/factories';
import {
  mockDeleteStackScript,
  mockGetStackScripts,
} from 'support/intercepts/stackscripts';
import { ui } from 'support/ui';

authenticate();
describe('Delete stackscripts', () => {
  /*
   * - Confirms StackScript deletion UI flow using mocked API data.
   * - Confirms that the stackscript item still exist when cancelling the delete operation.
   * - Confirms that the stackscript item can be deleted successfully.
   * - Confirms that "Automate Deployment with StackScripts!" welcome page appears when user has no StackScript.
   */
  it('deletes the stackscripts', () => {
    const stackScripts = stackScriptFactory.buildList(2, {
      is_public: false,
    });
    mockGetStackScripts(stackScripts).as('getStackScripts');
    cy.visitWithLogin('/stackscripts/account');
    cy.wait('@getStackScripts');

    // Do nothing when cancelling
    cy.get(`[aria-label="${stackScripts[0].label}"]`)
      .closest('tr')
      .within(() => {
        ui.actionMenu
          .findByTitle(`Action menu for StackScript ${stackScripts[0].label}`)
          .should('be.visible')
          .click();
      });
    ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
    ui.dialog
      .findByTitle(`Delete StackScript ${stackScripts[0].label}?`)
      .should('be.visible')
      .within(() => {
        ui.button.findByTitle('Cancel').should('be.visible').click();
      });

    cy.findByText(stackScripts[0].label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(stackScripts[0].description).should('be.visible');
      });

    // The StackScript is deleted successfully.
    cy.get(`[aria-label="${stackScripts[0].label}"]`)
      .closest('tr')
      .within(() => {
        ui.actionMenu
          .findByTitle(`Action menu for StackScript ${stackScripts[0].label}`)
          .should('be.visible')
          .click();
      });
    mockDeleteStackScript(stackScripts[0].id).as('deleteStackScript');
    mockGetStackScripts([stackScripts[1]]).as('getUpdatedStackScripts');
    ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
    ui.dialog
      .findByTitle(`Delete StackScript ${stackScripts[0].label}?`)
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Delete StackScript')
          .should('be.visible')
          .click();
      });
    cy.wait('@deleteStackScript');
    cy.wait('@getUpdatedStackScripts');

    cy.findByText(stackScripts[0].label).should('not.exist');

    // The "Automate Deployment with StackScripts!" welcome page appears when no StackScript exists.
    cy.get(`[aria-label="${stackScripts[1].label}"]`)
      .closest('tr')
      .within(() => {
        ui.actionMenu
          .findByTitle(`Action menu for StackScript ${stackScripts[1].label}`)
          .should('be.visible')
          .click();
      });
    mockDeleteStackScript(stackScripts[1].id).as('deleteStackScript');
    mockGetStackScripts([]).as('getUpdatedStackScripts');
    ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
    ui.dialog
      .findByTitle(`Delete StackScript ${stackScripts[1].label}?`)
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Delete StackScript')
          .should('be.visible')
          .click();
      });
    cy.wait('@deleteStackScript');
    cy.wait('@getUpdatedStackScripts');

    cy.findByText(stackScripts[1].label).should('not.exist');
    cy.findByText('Automate deployment scripts').should('be.visible');
  });
});
