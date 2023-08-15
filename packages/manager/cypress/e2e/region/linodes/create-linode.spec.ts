import { testRegions } from 'support/util/regions';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import type { Region } from '@linode/api-v4';

describe('Create Linodes', () => {
  /*
   * - Navigates to Linode create page.
   * - Selects a region, plan (Dedicated 4 GB), and enters label and password.
   * - Clicks "Create Linode" and confirms that new Linode boots.
   */
  testRegions('can create and boot a Linode', (region: Region) => {
    const label = randomLabel();

    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('linodes/create');

    // Select region and plan.
    cy.contains('Select a Region').should('be.visible').click();
    ui.regionSelect.findItemByRegionId(region.id).should('be.visible').click();

    cy.get('[data-qa-plan-row="Dedicated 4 GB"]')
      .closest('tr')
      .within(() => {
        cy.get('[data-qa-radio]').click();
      });

    // Enter label and password.
    cy.findByLabelText('Linode Label').click().clear().type(label);
    cy.findByLabelText('Root Password').click().type(randomString(32));

    // Submit.
    ui.button.findByTitle('Create Linode').click();

    // Confirm Linode boots.
    cy.wait('@createLinode');
    cy.findByText(label).should('be.visible');
    cy.findByText(region.label).should('be.visible');
    cy.findByText('RUNNING', { timeout: 180000 }).should('be.visible');
  });
});
