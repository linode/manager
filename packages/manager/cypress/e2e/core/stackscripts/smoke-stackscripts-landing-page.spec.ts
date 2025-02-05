import { authenticate } from 'support/api/authentication';
import { stackScriptFactory } from 'src/factories';
import { mockGetStackScripts } from 'support/intercepts/stackscripts';
import { ui } from 'support/ui';

authenticate();
describe('Display stackscripts', () => {
  /*
   * - Displays welcome message in the landing page.
   * - Confirms that "Automate Deployment with StackScripts!" welcome page appears when user has no StackScripts.
   */
  it('displays the correct welcome message in landing page', () => {
    mockGetStackScripts([]).as('getStackScripts');
    cy.visitWithLogin('/stackscripts/account');
    cy.wait('@getStackScripts');

    cy.findByText('Automate deployment scripts').should('be.visible');

    cy.get('[data-qa-placeholder-container="resources-section"]')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Create StackScript')
          .should('be.visible')
          .should('be.enabled');
      });
  });

  /*
   * - Displays Account StackScripts in the landing page.
   * - Confirms that all the StackScripts are shown as expected.
   */
  it('displays Account StackScripts in landing page', () => {
    const stackScripts = stackScriptFactory.buildList(2);
    mockGetStackScripts(stackScripts).as('getStackScripts');
    cy.visitWithLogin('/stackscripts/account');
    cy.wait('@getStackScripts');

    stackScripts.forEach((stackScript) => {
      cy.get(`[data-qa-table-row="${stackScript.label}"]`)
        .closest('tr')
        .within(() => {
          cy.findByText(stackScript.deployments_total).should('be.visible');
          cy.findByText(`${stackScript.updated.split('T')[0]}`).should(
            'be.visible'
          );
          if (stackScript.is_public) {
            cy.findByText('Public').should('be.visible');
          }
        });
    });
  });
});
