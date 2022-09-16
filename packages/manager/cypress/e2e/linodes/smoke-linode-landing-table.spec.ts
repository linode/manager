/* eslint-disable sonarjs/no-duplicate-string */
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
import { interceptOnce } from 'cypress/support/ui/common';

const regions = {
  'us-west': 'Fremont, CA',
  'us-southeast': 'Atlanta, GA',
  'us-east': 'Newark, NJ',
  'us-central': 'Dallas, TX',
  'ca-east': 'Toronto, ON',
};
const mockLinodes = makeResourcePage(linodeFactory.buildList(5));
mockLinodes.data.forEach(
  (linode, index) => (linode.region = Object.keys(regions)[index])
);

const appRoot = Cypress.env('REACT_APP_APP_ROOT');
const linodeLabel = (number) => {
  return mockLinodes.data[number - 1].label;
};

const deleteLinodeFromActionMenu = (linodeLabel) => {
  getClick(`[aria-label="Action menu for Linode ${linodeLabel}"]`);
  cy.get(`[data-qa-action-menu-item="Delete"]`).filter(`:visible`).click();
  cy.findAllByRole('button').filter(':contains("Delete")').click();
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
      req.reply(mockLinodes);
    }).as('getLinodes');
    cy.visitWithLogin('/', { preferenceOverrides });
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

  it('checks label and region sorting behavior for linode table', () => {
    const firstLinodeLabel = mockLinodes.data[0].label;
    const lastLinodeLabel = mockLinodes.data[4].label;
    const firstRegionLabel = Object.values(regions)[0];
    const lastRegionLabel = Object.values(regions)[4];

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

    checkFirstRow(lastRegionLabel);
    checkLastRow(firstRegionLabel);
    getClick('[aria-label="Sort by region"]').click();
    checkFirstRow(firstRegionLabel);
    checkLastRow(lastRegionLabel);
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
    const ip = mockLinodes.data[0].ipv4[0];
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
    getVisible(
      '[aria-label="Toggle display"][aria-describedby="displayViewDescription"][title="Summary view"]'
    );
    getVisible(
      '[aria-label="Toggle group by tag"][aria-describedby="groupByDescription"][title="Group by tag"]'
    );

    getVisible(`tr[data-qa-linode="${label}"]`).within(() => {
      cy.get(`[data-qa-ip-main]`)
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
