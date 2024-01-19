import { authenticate } from 'support/api/authentication';
import { createLinode } from '@linode/api-v4/lib/linodes';
import { createLinodeRequestFactory } from '@src/factories/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { apiMatcher } from 'support/util/intercepts';
import { Linode } from '@linode/api-v4';
import { accountSettingsFactory } from '@src/factories/accountSettings';
import { randomLabel } from 'support/util/random';
import { getClick, getVisible } from 'support/helpers';

const confirmDeletion = (linodeLabel: string) => {
  cy.url().should('endWith', '/linodes');
  cy.findByText(linodeLabel).should('not.exist');

  // Confirm the linode instance is removed
  cy.findByText(
    'Search for Linodes, Volumes, NodeBalancers, Domains, Buckets, Tags...'
  )
    .click()
    .type(`${linodeLabel}{enter}`);
  cy.findByText('You searched for ...').should('be.visible');
  cy.findByText('Sorry, no results for this one').should('be.visible');
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
      cy.findByLabelText('Linode Label')
        .should('be.visible')
        .click()
        .type(linodeLabel);

      ui.buttonGroup
        .findButtonByTitle('Delete')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

  cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
  cy.findByText(linodeLabel).should('not.exist');
};

const preferenceOverrides = {
  linodes_view_style: 'list',
  linodes_group_by_tag: false,
  volumes_group_by_tag: false,
  desktop_sidebar_open: false,
  sortKeys: {
    'linodes-landing': { order: 'asc', orderBy: 'label' },
    volume: { order: 'asc', orderBy: 'label' },
  },
};

authenticate();
describe('delete linode', () => {
  before(() => {
    cleanUp(['linodes', 'lke-clusters']);
  });

  it('deletes linode from linode details page', () => {
    const linodeCreatePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
    });
    cy.defer(createLinode(linodeCreatePayload)).then((linode) => {
      // catch delete request
      cy.intercept('DELETE', apiMatcher('linode/instances/*')).as(
        'deleteLinode'
      );
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
          cy.findByLabelText('Linode Label')
            .should('be.visible')
            .click()
            .type(linode.label);

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
    cy.defer(createLinode(linodeCreatePayload)).then((linode) => {
      // catch delete request
      cy.intercept('DELETE', apiMatcher('linode/instances/*')).as(
        'deleteLinode'
      );
      cy.visitWithLogin(`/linodes/${linode.id}`);

      // Wait for content to load before performing actions via action menu.
      cy.findByText('Stats for this Linode are not available yet');

      // Go to setting tab
      cy.findByText('Settings').should('be.visible').click();

      // Check elements in setting tab
      cy.findByText('Linode Label').should('be.visible');
      cy.findByText('Reset Root Password').should('be.visible');
      cy.findByText('Notification Thresholds').should('be.visible');
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
          cy.findByLabelText('Linode Label')
            .should('be.visible')
            .click()
            .type(linode.label);

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
    cy.defer(createLinode(linodeCreatePayload)).then((linode) => {
      // catch delete request
      cy.intercept('DELETE', apiMatcher('linode/instances/*')).as(
        'deleteLinode'
      );
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
          cy.findByLabelText('Linode Label')
            .should('be.visible')
            .click()
            .type(linode.label);

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
        createLinode(
          createLinodeRequestFactory.build({ label: randomLabel() })
        ),
        createLinode(
          createLinodeRequestFactory.build({ label: randomLabel() })
        ),
      ]);
    };

    cy.intercept('GET', apiMatcher('account/settings'), (req) => {
      req.reply(mockAccountSettings);
    }).as('getAccountSettings');

    cy.intercept('DELETE', apiMatcher('linode/instances/*')).as('deleteLinode');
    cy.defer(createTwoLinodes()).then(([linodeA, linodeB]) => {
      cy.visitWithLogin('/linodes', { preferenceOverrides });
      cy.wait('@getAccountSettings');
      getVisible('[data-qa-header="Linodes"]');
      if (!cy.get('[data-qa-sort-label="asc"]')) {
        getClick('[aria-label="Sort by label"]');
      }
      deleteLinodeFromActionMenu(linodeA.label);
      deleteLinodeFromActionMenu(linodeB.label);
      cy.findByText('Oh Snap!', { timeout: 1000 }).should('not.exist');
    });
  });
});
