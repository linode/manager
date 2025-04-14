import { createLinodeRequestFactory } from '@linode/utilities';
import { accountSettingsFactory } from '@src/factories/accountSettings';
import { authenticate } from 'support/api/authentication';
import { mockGetAccountSettings } from 'support/intercepts/account';
import { interceptDeleteLinode } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel } from 'support/util/random';

import type { Linode } from '@linode/api-v4';

const confirmDeletion = (linodeLabel: string) => {
  cy.url().should('endWith', '/linodes');
  cy.findByText(linodeLabel).should('not.exist');

  // Confirm the linode instance is removed
  ui.mainSearch.find().type(`${linodeLabel}{enter}`);
  cy.findByText('You searched for ...').should('be.visible');
  cy.findByText('Sorry, no results for this one.').should('be.visible');
};

const deleteLinodeFromActionMenu = (linodeLabel: string) => {
  ui.actionMenu
    .findByTitle(`Action menu for Linode ${linodeLabel}`)
    .should('be.visible')
    .click();

  ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

  ui.dialog
    .findByTitle(`Delete ${linodeLabel}?`)
    .should('be.visible')
    .within(() => {
      cy.findByLabelText('Linode Label').should('be.visible').click();
      cy.focused().type(linodeLabel);

      ui.buttonGroup
        .findButtonByTitle('Delete')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

  cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
  cy.findAllByText(linodeLabel).should('not.exist');
};

const preferenceOverrides = {
  desktop_sidebar_open: false,
  linodes_group_by_tag: false,
  linodes_view_style: 'list',
  sortKeys: {
    'linodes-landing': { order: 'asc', orderBy: 'label' },
    volume: { order: 'asc', orderBy: 'label' },
  },
  volumes_group_by_tag: false,
};

authenticate();
describe('delete linode', () => {
  before(() => {
    cleanUp(['linodes', 'lke-clusters']);
  });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  it('deletes linode from linode details page', () => {
    const linodeCreatePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
    });
    cy.defer(() => createTestLinode(linodeCreatePayload)).then((linode) => {
      // catch delete request
      interceptDeleteLinode(linode.id).as('deleteLinode');
      cy.visitWithLogin(`/linodes/${linode.id}`);

      // Wait for content to load before performing actions via action menu.
      cy.findByText('Stats for this Linode are not available yet');

      // Delete linode
      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem
        .findByTitle('Delete')
        .as('deleteButton')
        .should('be.visible');

      cy.get('@deleteButton').click();

      ui.dialog
        .findByTitle(`Delete ${linode.label}?`)
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('Linode Label').should('be.visible').click();
          cy.focused().type(linode.label);

          ui.buttonGroup
            .findButtonByTitle('Delete')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm delete
      cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
      confirmDeletion(linode.label);
    });
  });

  it('deletes linode from setting tab in linode details page', () => {
    const linodeCreatePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
    });
    cy.defer(() => createTestLinode(linodeCreatePayload)).then((linode) => {
      // catch delete request
      interceptDeleteLinode(linode.id).as('deleteLinode');
      cy.visitWithLogin(`/linodes/${linode.id}`);

      // Wait for content to load before performing actions via action menu.
      cy.findByText('Stats for this Linode are not available yet');

      // Go to setting tab
      cy.findByText('Settings').should('be.visible').click();

      // Check elements in setting tab
      cy.findByText('Linode Label').should('be.visible');
      cy.findByText('Reset Root Password').should('be.visible');
      cy.findByText('Shutdown Watchdog').should('be.visible');
      cy.findByText('Delete Linode').should('be.visible');

      // Delete linode
      ui.button
        .findByTitle('Delete')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.dialog
        .findByTitle(`Delete ${linode.label}?`)
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('Linode Label').should('be.visible').click();
          cy.focused().type(linode.label);

          ui.buttonGroup
            .findButtonByTitle('Delete')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm delete
      cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
      confirmDeletion(linode.label);
    });
  });

  it('deletes linode from linode landing page', () => {
    const linodeCreatePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
    });
    cy.defer(() => createTestLinode(linodeCreatePayload)).then((linode) => {
      // catch delete request
      interceptDeleteLinode(linode.id).as('deleteLinode');
      cy.visitWithLogin(`/linodes`);

      cy.findByText(linode.label).should('be.visible');

      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem
        .findByTitle('Delete')
        .as('deleteButton')
        .should('be.visible');

      cy.get('@deleteButton').click();

      ui.dialog
        .findByTitle(`Delete ${linode.label}?`)
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('Linode Label').should('be.visible').click();
          cy.focused().type(linode.label);

          ui.buttonGroup
            .findButtonByTitle('Delete')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm delete
      cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
      confirmDeletion(linode.label);
    });
  });

  it('deleting multiple linodes with action menu', () => {
    const mockAccountSettings = accountSettingsFactory.build({
      managed: false,
    });

    const createTwoLinodes = async (): Promise<[Linode, Linode]> => {
      return Promise.all([
        createTestLinode(
          createLinodeRequestFactory.build({ label: randomLabel() })
        ),
        createTestLinode(
          createLinodeRequestFactory.build({ label: randomLabel() })
        ),
      ]);
    };

    mockGetAccountSettings(mockAccountSettings).as('getAccountSettings');

    cy.defer(() => createTwoLinodes()).then(([linodeA, linodeB]) => {
      interceptDeleteLinode(linodeA.id).as('deleteLinode');
      interceptDeleteLinode(linodeB.id).as('deleteLinode');
      cy.visitWithLogin('/linodes', { preferenceOverrides });
      cy.wait('@getAccountSettings');
      cy.get('[data-qa-header="Linodes"]').should('be.visible');
      if (!cy.get('[data-qa-sort-label="asc"]')) {
        cy.get('[aria-label="Sort by label"]').click();
      }
      deleteLinodeFromActionMenu(linodeA.label);
      deleteLinodeFromActionMenu(linodeB.label);
      cy.findByText('Oh Snap!', { timeout: 1000 }).should('not.exist');
    });
  });
});
