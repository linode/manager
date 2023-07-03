import { testRegions } from 'support/util/regions';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import type { Region } from '@linode/api-v4';

describe('Create Linodes', () => {
  testRegions('can create and boot a Linode', (region: Region) => {
    const label = randomLabel();

    interceptCreateLinode().as('createLinode');
    cy.visitWithLogin('linodes/create');

    cy.contains('Select a Region')
      .should('be.visible')
      .click();

    ui.regionSelect
      .findItemByRegionId(region.id)
      .should('be.visible')
      .click();

    cy.get('[data-qa-plan-row="Dedicated 4 GB"]')
      .closest('tr')
      .within(() => {
        cy.get('[data-qa-radio]')
          .click();
      });

    cy.findByLabelText('Linode Label')
      .click()
      .clear()
      .type(label);

    cy.findByLabelText('Root Password')
      .click()
      .type(randomString(32));

    ui.button
      .findByTitle('Create Linode')
      .click();

    cy.wait('@createLinode');
    cy.findByText(label).should('be.visible');
    cy.findByText(region.label).should('be.visible');
    cy.findByText('RUNNING').should('be.visible');
  });
});
