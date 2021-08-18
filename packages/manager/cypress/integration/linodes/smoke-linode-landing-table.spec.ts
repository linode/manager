import { contains } from 'cypress/types/jquery';
import { createLinode } from '../../support/api/linodes';
import { fbtVisible, getClick, getVisible } from '../../support/helpers';
import { linodeFactory } from '@src/factories/linodes';
import { makeResourcePage } from '@src/mocks/serverHandlers';

const appRoot = Cypress.env('REACT_APP_APP_ROOT');

const deleteLinodeFromActionMenu = (linodeLabel) => {
  getClick(`[aria-label="Action menu for Linode ${linodeLabel}"]`);
  // the visible filter is to ignore all closed action menus
  cy.get(`[data-qa-action-menu-item="Delete"]`).filter(`:visible`).click();
  // There is 2 visible delete on the page, this is why i used this strategy
  cy.findAllByRole('button').filter(':contains("Delete")').click();
  cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
};

const mockLinodes = makeResourcePage(linodeFactory.buildList(5));

describe('linode landing', () => {
  it('checks the landng page menu items, labels, and buttons', () => {
    cy.intercept('GET', '*/profile').as('getProfile');
    cy.intercept('GET', '*/linode/instances/*', (req) => {
      req.reply(mockLinodes);
    }).as('getLinodes');
    cy.visitWithLogin('/');
    cy.wait('@getLinodes');
    cy.wait('@getProfile').then((xhr) => {
      const username = xhr.response?.body.username;
      cy.url().should('eq', `${appRoot}/linodes`);

      // side menu
      getVisible('[title="Dashboard"][href="/dashboard"]');
      getVisible('[data-testid="menu-item-Linodes"][href="/linodes"]');
      getVisible('[data-testid="menu-item-Volumes"][href="/volumes"]');
      getVisible(
        '[data-testid="menu-item-NodeBalancers"][href="/nodebalancers"]'
      );
      getVisible('[data-testid="menu-item-Firewalls"][href="/firewalls"]');
      getVisible(
        '[data-testid="menu-item-StackScripts"][href="/stackscripts"]'
      );
      getVisible('[data-testid="menu-item-Images"][href="/images"]');
      getVisible('[data-testid="menu-item-Domains"][href="/domains"]');
      getVisible(
        '[data-testid="menu-item-Kubernetes"][href="/kubernetes/clusters"]'
      );
      getVisible(
        '[data-testid="menu-item-Object Storage"][href="/object-storage/buckets"]'
      );
      getVisible('[data-testid="menu-item-Longview"][href="/longview"]');
      getVisible(
        '[data-testid="menu-item-Marketplace"][href="/linodes/create?type=One-Click"]'
      );
      getVisible('[data-testid="menu-item-Account"][href="/account"]');
      getVisible('[data-testid="menu-item-Help & Support"][href="/support"]');

      // top menu
      getVisible('[aria-label="open menu"]');
      getVisible('[data-qa-add-new-menu-button="true"]');
      getVisible('[data-qa-search-icon="true"]');
      fbtVisible(
        'Search for Linodes, Volumes, NodeBalancers, Domains, Buckets, Tags...'
      );
      getVisible('[aria-label="Link to Linode Support"][href="/support"]');
      getVisible('[href="https://linode.com/community"]').within(() => {
        getVisible('[title="Linode Cloud Community"]');
      });
      getVisible('[aria-label="Notifications"]');
      getVisible('[data-testid="nav-group-profile"]').within(() => {
        fbtVisible(username);
      });

      // labels and buttons
      getVisible('h1[data-qa-header="Linodes"]');
      getVisible('button[title="Docs"][data-qa-icon-text-link="Docs"]');
      fbtVisible('Create Linode');
    });
  });

  it('deleting multiple linodes with action menu', () => {
    cy.intercept('DELETE', '*/linode/instances/*').as('deleteLinode');
    createLinode().then((linodeA) => {
      createLinode().then((linodeB) => {
        cy.visitWithLogin('/linodes');
        getVisible('[data-qa-header="Linodes"]');
        if (!cy.get('[data-qa-sort-label="asc"')) {
          getClick('[aria-label="Sort by label"]');
        }
        deleteLinodeFromActionMenu(linodeA.label);
        deleteLinodeFromActionMenu(linodeB.label);
        cy.findByText('Oh Snap!', { timeout: 1000 }).should('not.exist');
      });
    });
  });
});
