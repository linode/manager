/* eslint-disable sonarjs/no-duplicate-string */
import { Linode } from '@linode/api-v4/types';
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
import { ui } from 'support/ui';
import { regions, regionsMap } from 'support/constants/regions';

const mockLinodes = new Array(5).fill(null).map(
  (item: null, index: number): Linode => {
    return linodeFactory.build({
      label: `Linode ${index}`,
      region: regions[index],
    });
  }
);

const mockLinodesData = makeResourcePage(mockLinodes);

const sortByRegion = (a: Linode, b: Linode) => {
  return a.region.localeCompare(b.region);
};

const sortByLabel = (a: Linode, b: Linode) => {
  return a.label.localeCompare(b.label);
};

const linodeLabel = (number) => {
  return mockLinodes[number - 1].label;
};

const deleteLinodeFromActionMenu = (linodeLabel) => {
  getClick(`[aria-label="Action menu for Linode ${linodeLabel}"]`);
  cy.get(`[data-qa-action-menu-item="Delete"]`).filter(`:visible`).click();
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
      req.reply(mockLinodesData);
    }).as('getLinodes');
    cy.visitWithLogin('/', { preferenceOverrides });
    cy.wait('@getAccountSettings');
    cy.wait('@getLinodes');
    cy.url().should('endWith', routes.linodeLanding);
  });

  it('checks the landing page side menu items', () => {
    getVisible('[title="Akamai - Dashboard"][href="/dashboard"]');
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

  it('checks the landing top menu items', () => {
    cy.wait('@getProfile').then((xhr) => {
      const username = xhr.response?.body.username;
      getVisible('[aria-label="open menu"]');
      getVisible('[data-qa-add-new-menu-button="true"]');
      getVisible('[data-qa-search-icon="true"]');
      fbtVisible(
        'Search for Linodes, Volumes, NodeBalancers, Domains, Buckets, Tags...'
      );

      cy.findByLabelText('Link to Linode Support')
        .should('be.visible')
        .should('have.attr', 'href', '/support');

      cy.findByTitle('Linode Cloud Community')
        .should('be.visible')
        .parent()
        .should('have.attr', 'href', 'https://linode.com/community');

      getVisible('[aria-label="Notifications"]');
      getVisible('[data-testid="nav-group-profile"]').within(() => {
        fbtVisible(username);
      });
    });
  });

  it('checks the landing labels and buttons', () => {
    getVisible('h1[data-qa-header="Linodes"]');
    getVisible('button[title="Docs"][data-qa-icon-text-link="Docs"]');
    fbtVisible('Create Linode');
  });

  it('checks label and region sorting behavior for linode table', () => {
    const linodesByLabel = [...mockLinodes.sort(sortByLabel)];
    const linodesByRegion = [...mockLinodes.sort(sortByRegion)];
    const linodesLastIndex = mockLinodes.length - 1;

    const firstLinodeLabel = linodesByLabel[0].label;
    const lastLinodeLabel = linodesByLabel[linodesLastIndex].label;

    const firstRegionLabel = regionsMap[linodesByRegion[0].region];
    const lastRegionLabel =
      regionsMap[linodesByRegion[linodesLastIndex].region];

    const checkFirstRow = (label: string) => {
      getVisible('tr[data-qa-loading="true"]')
        .first()
        .within(() => {
          containsVisible(label);
        });
    };
    const checkLastRow = (label: string) => {
      getVisible('tr[data-qa-loading="true"]')
        .last()
        .within(() => {
          containsVisible(label);
        });
    };

    checkFirstRow(firstLinodeLabel);
    checkLastRow(lastLinodeLabel);
    getClick('[aria-label="Sort by label"]');
    checkFirstRow(lastLinodeLabel);
    checkLastRow(firstLinodeLabel);

    getClick('[aria-label="Sort by region"]');
    checkFirstRow(firstRegionLabel);
    checkLastRow(lastRegionLabel);
    getClick('[aria-label="Sort by region"]');
    checkFirstRow(lastRegionLabel);
    checkLastRow(firstRegionLabel);
  });

  it('checks the create menu dropdown items', () => {
    getClick('[data-qa-add-new-menu-button="true"]');
    getVisible(
      '[data-valuetext="LinodeHigh performance SSD Linux servers"][href="/linodes/create"]'
    );
    getVisible(
      '[data-valuetext="VolumeAttach additional storage to your Linode"][href="/volumes/create"]'
    );
    getVisible(
      '[data-valuetext="NodeBalancerEnsure your services are highly available"][href="/nodebalancers/create"]'
    );
    getVisible(
      '[data-valuetext="FirewallControl network access to your Linodes"][href="/firewalls/create"]'
    );
    getVisible(
      '[data-valuetext="DomainManage your DNS records"][href="/domains/create"]'
    );
    getVisible(
      '[data-valuetext="KubernetesHighly available container workloads"][href="/kubernetes/create"]'
    );
    getVisible(
      '[data-valuetext="BucketS3-compatible object storage"][href="/object-storage/buckets/create"]'
    );
    getVisible(
      '[data-valuetext="MarketplaceDeploy applications with ease"][href="/linodes/create?type=One-Click"]'
    );
  });

  it('checks the table and action menu buttons/labels', () => {
    const label = linodeLabel(1);
    const ip = mockLinodes[0].ipv4[0];
    getVisible('[aria-label="Sort by label"]').within(() => {
      fbtVisible('Label');
    });
    getVisible('[aria-label="Sort by _statusPriority"]').within(() => {
      fbtVisible('Status');
    });
    getVisible('[aria-label="Sort by type"]').within(() => {
      fbtVisible('Plan');
    });
    getVisible('[aria-label="Sort by ipv4[0]"]').within(() => {
      fbtVisible('IP Address');
    });

    cy.findByLabelText('Toggle display').should('be.visible');

    cy.findByLabelText('Toggle group by tag').should('be.visible');

    getVisible(`tr[data-qa-linode="${label}"]`).within(() => {
      ui.button
        .findByTitle(ip)
        .should('be.visible')
        .realHover()
        .then(() => {
          getVisible(`[aria-label="Copy ${ip} to clipboard"]`);
        });
      getVisible(`[aria-label="Action menu for Linode ${label}"]`);
    });
  });

  it('checks the action menu items', () => {
    const label = linodeLabel(1);
    getVisible(`tr[data-qa-linode="${label}"]`).within(() => {
      cy.findByLabelText(`Action menu for Linode ${label}`).click();
    });
    getVisible('[data-qa-action-menu-item="Power Off"]');
    getVisible('[data-qa-action-menu-item="Reboot"]');
    getVisible('[data-qa-action-menu-item="Launch LISH Console"]');
    getVisible('[data-qa-action-menu-item="Clone"]');
    getVisible('[data-qa-action-menu-item="Resize"]');
    getVisible('[data-qa-action-menu-item="Rebuild"]');
    getVisible('[data-qa-action-menu-item="Rescue"]');
    getVisible('[data-qa-action-menu-item="Migrate"]');
    getVisible('[data-qa-action-menu-item="Delete"]');
  });
});

describe('linode landing actions', () => {
  it('deleting multiple linodes with action menu', () => {
    const mockAccountSettings = accountSettingsFactory.build({
      managed: false,
    });

    cy.intercept('GET', '*/account/settings', (req) => {
      req.reply(mockAccountSettings);
    }).as('getAccountSettings');

    cy.intercept('DELETE', '*/linode/instances/*').as('deleteLinode');
    createLinode().then((linodeA) => {
      createLinode().then((linodeB) => {
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
});
