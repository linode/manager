/* eslint-disable sonarjs/no-duplicate-string */
import { Linode } from '@linode/api-v4';
import { accountSettingsFactory } from '@src/factories/accountSettings';
import { linodeFactory } from '@src/factories/linodes';
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
import { chooseRegion, getRegionById } from 'support/util/regions';
import { authenticate } from 'support/api/authentication';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { userPreferencesFactory, profileFactory } from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { grantsFactory } from '@src/factories/grants';
import { mockGetUser } from 'support/intercepts/account';
import {
  mockGetUserPreferences,
  mockUpdateUserPreferences,
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { randomLabel } from 'support/util/random';

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

const linodeLabel = (index: number) => {
  return mockLinodes[index - 1].label;
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
      cy.findByLabelText('Linode Cloud Community - link opens in a new tab')
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
    const menuItems = [
      'Power Off',
      'Reboot',
      'Launch LISH Console',
      'Clone',
      'Resize',
      'Rebuild',
      'Rescue',
      'Migrate',
      'Delete',
    ];

    ui.actionMenu
      .findByTitle(`Action menu for Linode ${label}`)
      .should('be.visible')
      .click();

    menuItems.forEach((menuItem) => {
      ui.actionMenuItem.findByTitle(menuItem).should('be.visible');
    });
  });

  it('checks group by tag for linde table', () => {
    mockGetLinodes(mockLinodes).as('getLinodes');
    cy.visitWithLogin('/linodes');
    cy.wait('@getLinodes');

    // Check 'Group by Tag' button works as expected that can be visible, enabled and clickable
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
    const mockPreferencesListView = userPreferencesFactory.build();

    const mockPreferencesSummaryView = {
      ...mockPreferencesListView,
      linodes_view_style: 'grid',
    };

    mockGetLinodes(mockLinodes).as('getLinodes');
    mockGetUserPreferences(mockPreferencesListView).as('getUserPreferences');
    mockUpdateUserPreferences(mockPreferencesSummaryView).as(
      'updateUserPreferences'
    );

    cy.visitWithLogin('/linodes');
    cy.wait(['@getLinodes', '@getUserPreferences']);

    // Check 'Summary View' button works as expected that can be visiable, enabled and clickable
    getVisible('[aria-label="Toggle display"]').should('be.enabled').click();
    cy.wait('@updateUserPreferences');

    mockLinodes.forEach((linode) => {
      cy.findByText(linode.label)
        .should('be.visible')
        .closest('[data-qa-linode-card]')
        .within(() => {
          cy.findByText('Summary').should('be.visible');
          cy.findByText('Public IP Addresses').should('be.visible');
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
    cy.findByText('Public IP Addresses').should('not.exist');
    cy.findByText('Access').should('not.exist');

    cy.findByText('Plan:').should('not.exist');
    cy.findByText('Region:').should('not.exist');
    cy.findByText('Linode ID:').should('not.exist');
    cy.findByText('Created:').should('not.exist');
  });
});

describe('linode landing checks for empty state', () => {
  beforeEach(() => {
    // Mock setup to display the Linode landing page in an empty state
    mockGetLinodes([]).as('getLinodes');
  });

  it('checks empty state on linode landing page', () => {
    // Login and wait for application to load
    cy.visitWithLogin(routes.linodeLanding);
    cy.wait('@getLinodes');
    cy.url().should('endWith', routes.linodeLanding);

    // Aliases created for accessing child elements during assertions
    cy.get('div[data-qa-placeholder-container="resources-section"]').as(
      'resourcesSection'
    );
    cy.get('@resourcesSection')
      .get('h1[data-qa-header]')
      .contains('Linodes')
      .as('linodesHeader');

    // Assert that fields with Linodes and Cloud-based virtual machines text are visible
    cy.get('@linodesHeader').should('be.visible');
    cy.get('@linodesHeader')
      .next('h2')
      .should('be.visible')
      .should('have.text', 'Cloud-based virtual machines');

    //Assert that recommended section is visible - Getting Started Guides, Deploy an App and Video Playlist
    cy.get('@resourcesSection')
      .contains('h2', 'Getting Started Guides')
      .should('be.visible');
    cy.get('@resourcesSection')
      .contains('h2', 'Deploy an App')
      .should('be.visible');
    cy.get('@resourcesSection')
      .contains('h2', 'Video Playlist')
      .should('be.visible');

    // Assert that Create Linode button is visible and enabled
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .and('be.enabled');

    // Assert that List of Liondes table does not exist
    cy.get('table[aria-label="List of Linodes"]').should('not.exist');

    // Assert that Docs link does not exist
    cy.get(
      'a[aria-label="Docs - link opens in a new tab"][data-testid="external-link"]'
    ).should('not.exist');

    // Assert that Download CSV button does not exist
    cy.get('span[data-testid="loadingIcon"]')
      .contains('Download CSV')
      .should('not.exist');
  });

  it('checks restricted user has no access to create linode on linode landing page', () => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
    // simulating a default user without the ability to add Linodes.
    const mockProfile = profileFactory.build({
      username: randomLabel(),
      restricted: true,
    });

    const mockUser = accountUserFactory.build({
      username: mockProfile.username,
      restricted: true,
      user_type: 'default',
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_linodes: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);

    // Login and wait for application to load
    cy.visitWithLogin(routes.linodeLanding);
    cy.wait('@getLinodes');
    cy.url().should('endWith', routes.linodeLanding);

    // Assert that Create Linode button is visible and disabled
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .and('be.disabled')
      .trigger('mouseover');

    // Assert that tooltip is visible with message
    ui.tooltip
      .findByText(
        "You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions."
      )
      .should('be.visible');
  });
});

describe('linode landing checks for non-empty state with restricted user', () => {
  beforeEach(() => {
    // Mock setup to display the Linode landing page in an empty state
    const mockLinodes = new Array(1).fill(null).map(
      (_item: null, index: number): Linode => {
        return linodeFactory.build({
          label: `Linode ${index}`,
          region: chooseRegion().id,
          tags: [index % 2 == 0 ? 'even' : 'odd', 'nums'],
        });
      }
    );

    const mockLinodesData = makeResourcePage(mockLinodes);
    cy.intercept('GET', apiMatcher('linode/instances/*'), (req) => {
      req.reply(mockLinodesData);
    }).as('getLinodes');
  });

  it('checks restricted user with read access has no access to create linode on linode landing page', () => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
    // simulating a default user without the ability to add Linodes.
    const mockProfile = profileFactory.build({
      username: randomLabel(),
      restricted: true,
    });

    const mockUser = accountUserFactory.build({
      username: mockProfile.username,
      restricted: true,
      user_type: 'default',
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_linodes: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);

    // Login and wait for application to load
    cy.visitWithLogin(routes.linodeLanding);
    cy.wait('@getLinodes');
    cy.url().should('endWith', routes.linodeLanding);

    // Assert that Create Linode button is visible and disabled
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .and('be.disabled')
      .trigger('mouseover');

    // Assert that tooltip is visible with message
    ui.tooltip
      .findByText(
        "You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions."
      )
      .should('be.visible');
  });

  it.only('checks restricted user with no access cannot see existing linode and cannot create linode', () => {
    const mockProfile = profileFactory.build({
      username: randomLabel(),
      restricted: true,
    });

    const mockUser = accountUserFactory.build({
      username: mockProfile.username,
      restricted: true,
      user_type: 'default',
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_linodes: false,
      },
      linode: [
        {
          id: 0,
          permissions: null,
        },
      ],
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);

    // Login and wait for application to load
    cy.visitWithLogin(routes.linodeLanding);
    cy.wait('@getLinodes');
    cy.url().should('endWith', routes.linodeLanding);

    // Assert that Create Linode button is visible and disabled
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .and('be.disabled')
      .trigger('mouseover');
  });
});
