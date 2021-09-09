import { createLinode } from '../../support/api/linodes';
import {
  containsVisible,
  fbtVisible,
  getClick,
  getVisible,
} from '../../support/helpers';
import { linodeFactory } from '@src/factories/linodes';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { accountSettingsFactory } from '@src/factories/accountSettings';
import { routes } from 'cypress/support/ui/constants';
import * as Factory from 'factory.ts';
import { Linode } from '@linode/api-v4/lib/linodes/types';

const regions: string[] = [
  'us-east',
  'us-west',
  'us-central',
  'us-southeast',
  'ca-east',
];
const mockLinodes = makeResourcePage(linodeFactory.buildList(5));
mockLinodes.data.forEach((linode, index) => (linode.region = regions[index]));

const appRoot = Cypress.env('REACT_APP_APP_ROOT');

const deleteLinodeFromActionMenu = (linodeLabel) => {
  getClick(`[aria-label="Action menu for Linode ${linodeLabel}"]`);
  // the visible filter is to ignore all closed action menus
  cy.get(`[data-qa-action-menu-item="Delete"]`).filter(`:visible`).click();
  // There is 2 visible delete on the page, this is why i used this strategy
  cy.findAllByRole('button').filter(':contains("Delete")').click();
  cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
};

describe('linode landing checks', () => {
  beforeEach(() => {
    const mockAccountSettings = accountSettingsFactory.build({
      managed: false,
    });

    cy.intercept('GET', '*/account/settings', (req) => {
      req.reply(mockAccountSettings);
    }).as('getAccountSettings');
    cy.intercept('GET', '*/profile').as('getProfile');
    cy.intercept('GET', '*/linode/instances/*', (req) => {
      req.reply(mockLinodes);
    }).as('getLinodes');
    cy.visitWithLogin('/');
    cy.wait('@getAccountSettings');
    cy.wait('@getLinodes');
    cy.url().should('eq', `${appRoot}${routes.linodeLanding}`);
  });

  it('checks the landng page side menu items', () => {
    getVisible('[title="Dashboard"][href="/dashboard"]');
    getVisible('[data-testid="menu-item-Linodes"][href="/linodes"]');
    getVisible('[data-testid="menu-item-Volumes"][href="/volumes"]');
    getVisible(
      '[data-testid="menu-item-NodeBalancers"][href="/nodebalancers"]'
    );
    getVisible('[data-testid="menu-item-Firewalls"][href="/firewalls"]');
    getVisible('[data-testid="menu-item-StackScripts"][href="/stackscripts"]');
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
  });

  it('checks the landng top menu items', () => {
    cy.wait('@getProfile').then((xhr) => {
      const username = xhr.response?.body.username;
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
    });
  });

  it('checks the landng labels and buttons', () => {
    getVisible('h1[data-qa-header="Linodes"]');
    getVisible('button[title="Docs"][data-qa-icon-text-link="Docs"]');
    fbtVisible('Create Linode');
  });

  it.only('checks sorting behavior for linode table', () => {
    // sort by label
    const firstLinodeLabel = mockLinodes.data[0].label;
    const lastLinodeLabel = mockLinodes.data[4].label;

    const checkFirstRow = (linodeLabel) => {
      getVisible('tr[data-qa-loading="true"]')
        .first()
        .within(() => {
          containsVisible(linodeLabel);
        });
    };
    const checkLastRow = (linodeLabel) => {
      getVisible('tr[data-qa-loading="true"]')
        .last()
        .within(() => {
          containsVisible(linodeLabel);
        });
    };

    checkFirstRow(firstLinodeLabel);
    checkLastRow(lastLinodeLabel);
    getClick('[aria-label="Sort by label"]');
    checkFirstRow(lastLinodeLabel);
    checkLastRow(firstLinodeLabel);
  });
});

describe('linode landing actions', () => {
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
