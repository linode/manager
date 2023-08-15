/* eslint-disable sonarjs/no-duplicate-string */
import { createLinode } from '@linode/api-v4';
import { Linode } from '@linode/api-v4/types';
import { accountSettingsFactory } from '@src/factories/accountSettings';
import {
  createLinodeRequestFactory,
  linodeFactory,
} from '@src/factories/linodes';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import {
  containsVisible,
  fbtVisible,
  getClick,
  getVisible,
} from 'support/helpers';
import { ui } from 'support/ui';
import { routes } from 'support/ui/constants';
import { apiMatcher } from 'support/util/intercepts';
import { randomLabel } from 'support/util/random';
import { chooseRegion, getRegionById } from 'support/util/regions';
import { authenticate } from 'support/api/authentication';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { cleanUp } from 'support/util/cleanup';

const mockLinodes = new Array(5).fill(null).map(
  (_item: null, index: number): Linode => {
    return linodeFactory.build({
      label: `Linode ${index}`,
      region: chooseRegion().id,
      tags: [index % 2 == 0 ? 'even' : 'odd', 'nums'],
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
describe('linode landing checks', () => {
  beforeEach(() => {
    const mockAccountSettings = accountSettingsFactory.build({
      managed: false,
    });

    cy.intercept('GET', apiMatcher('account/settings'), (req) => {
      req.reply(mockAccountSettings);
    }).as('getAccountSettings');
    cy.intercept('GET', apiMatcher('profile')).as('getProfile');
    cy.intercept('GET', apiMatcher('linode/instances/*'), (req) => {
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

      cy.findByLabelText('Help & Support')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/support');
      cy.go('back');

      // Cypress cannot work with other tabs and windows, so we can't test
      // that this takes the user to the expected place since it has no `href`
      // attribute.
      cy.findByLabelText('Linode Cloud Community (opens in new tab)')
        .should('be.visible')
        .should('be.enabled');

      getVisible('[aria-label="Notifications"]');
      getVisible('[data-testid="nav-group-profile"]').within(() => {
        fbtVisible(username);
      });
    });
  });

  it('checks the landing labels and buttons', () => {
    getVisible('h1[data-qa-header="Linodes"]');
    getVisible('a[aria-label="Docs - link opens in a new tab"]');
    fbtVisible('Create Linode');
  });

  it('checks label and region sorting behavior for linode table', () => {
    const linodesByLabel = [...mockLinodes.sort(sortByLabel)];
    const linodesByRegion = [...mockLinodes.sort(sortByRegion)];
    const linodesLastIndex = mockLinodes.length - 1;

    const firstLinodeLabel = linodesByLabel[0].label;
    const lastLinodeLabel = linodesByLabel[linodesLastIndex].label;

    const firstRegionLabel = getRegionById(linodesByRegion[0].region).label;
    const lastRegionLabel = getRegionById(
      linodesByRegion[linodesLastIndex].region
    ).label;

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

    getVisible('[aria-labelledby="create-menu"]').within(() => {
      getVisible('[href="/linodes/create"]').within(() => {
        fbtVisible('Linode');
        fbtVisible('High performance SSD Linux servers');
      });

      getVisible('[href="/volumes/create"]').within(() => {
        fbtVisible('Volume');
        fbtVisible('Attach additional storage to your Linode');
      });

      getVisible('[href="/nodebalancers/create"]').within(() => {
        fbtVisible('NodeBalancer');
        fbtVisible('Ensure your services are highly available');
      });

      getVisible('[href="/firewalls/create"]').within(() => {
        fbtVisible('Firewall');
        fbtVisible('Control network access to your Linodes');
      });

      getVisible('[href="/firewalls/create"]').within(() => {
        fbtVisible('Firewall');
        fbtVisible('Control network access to your Linodes');
      });

      getVisible('[href="/domains/create"]').within(() => {
        fbtVisible('Domain');
        fbtVisible('Manage your DNS records');
      });

      getVisible('[href="/kubernetes/create"]').within(() => {
        fbtVisible('Kubernetes');
        fbtVisible('Highly available container workloads');
      });

      getVisible('[href="/object-storage/buckets/create"]').within(() => {
        fbtVisible('Bucket');
        fbtVisible('S3-compatible object storage');
      });

      getVisible('[href="/linodes/create?type=One-Click"]').within(() => {
        fbtVisible('Marketplace');
        fbtVisible('Deploy applications with ease');
      });
    });
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
      fbtVisible('Public IP Address');
    });

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

  it('checks group by tag for linde table', () => {
    mockGetLinodes(mockLinodes).as('getLinodes');
    cy.visitWithLogin('/linodes');
    cy.wait('@getLinodes');

    // Check 'Group by Tag' button works as expected that can be visiable, enabled and clickable
    getVisible('[aria-label="Toggle group by tag"]')
      .should('be.enabled')
      .click();
    getVisible('[data-qa-tag-header="even"]');
    cy.get('[data-qa-tag-header="even"]').within(() => {
      mockLinodes.forEach((linode) => {
        if (linode.tags.includes('even')) {
          cy.findByText(linode.label).should('be.visible');
        } else {
          cy.findByText(linode.label).should('not.exist');
        }
      });
    });

    getVisible('[data-qa-tag-header="odd"]');
    cy.get('[data-qa-tag-header="odd"]').within(() => {
      mockLinodes.forEach((linode) => {
        if (linode.tags.includes('odd')) {
          cy.findByText(linode.label).should('be.visible');
        } else {
          cy.findByText(linode.label).should('not.exist');
        }
      });
    });

    getVisible('[data-qa-tag-header="nums"]');
    cy.get('[data-qa-tag-header="nums"]').within(() => {
      mockLinodes.forEach((linode) => {
        cy.findByText(linode.label).should('be.visible');
      });
    });

    // The linode landing table will resume when ungroup the tag.
    getVisible('[aria-label="Toggle group by tag"]')
      .should('be.enabled')
      .click();
    cy.get('[data-qa-tag-header="even"]').should('not.exist');
    cy.get('[data-qa-tag-header="odd"]').should('not.exist');
    cy.get('[data-qa-tag-header="nums"]').should('not.exist');
    mockLinodes.forEach((linode) => {
      cy.findByText(linode.label).should('be.visible');
    });
  });

  it('checks summary view for linode table', () => {
    mockGetLinodes(mockLinodes).as('getLinodes');
    cy.visitWithLogin('/linodes');
    cy.wait('@getLinodes');

    // Check 'Summary View' button works as expected that can be visiable, enabled and clickable
    getVisible('[aria-label="Toggle display"]').should('be.enabled').click();

    mockLinodes.forEach((linode) => {
      cy.findByText(linode.label)
        .should('be.visible')
        .closest('[data-qa-linode-card]')
        .within(() => {
          cy.findByText('Summary').should('be.visible');
          cy.findByText('IP Addresses').should('be.visible');
          cy.findByText('Access').should('be.visible');

          cy.findByText('Plan:').should('be.visible');
          cy.findByText('Region:').should('be.visible');
          cy.findByText('Linode ID:').should('be.visible');
          cy.findByText('Created:').should('be.visible');
        });
    });

    // Toggle the 'List View' button to check the display of table items are back to the original view.
    getVisible('[aria-label="Toggle display"]').should('be.enabled').click();

    cy.findByText('Summary').should('not.exist');
    cy.findByText('IP Addresses').should('not.exist');
    cy.findByText('Access').should('not.exist');

    cy.findByText('Plan:').should('not.exist');
    cy.findByText('Region:').should('not.exist');
    cy.findByText('Linode ID:').should('not.exist');
    cy.findByText('Created:').should('not.exist');
  });
});

describe('linode landing actions', () => {
  before(() => {
    cleanUp('linodes');
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
