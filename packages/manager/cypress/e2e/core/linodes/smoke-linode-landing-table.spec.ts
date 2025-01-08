/* eslint-disable sonarjs/no-duplicate-string */
import { Linode } from '@linode/api-v4';
import { accountSettingsFactory } from '@src/factories/accountSettings';
import { linodeFactory } from '@src/factories/linodes';
import { makeResourcePage } from '@src/mocks/serverHandlers';
// import {
//   cy.findByText,
// } from 'support/helpers';
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
    cy.get('[title="Akamai - Dashboard"][href="/dashboard"]').should(
      'be.visible'
    );
    cy.get('[data-testid="menu-item-Linodes"][href="/linodes"]').should(
      'be.visible'
    );
    cy.get('[data-testid="menu-item-Volumes"][href="/volumes"]').should(
      'be.visible'
    );
    cy.get(
      '[data-testid="menu-item-NodeBalancers"][href="/nodebalancers"]'
    ).should('be.visible');
    cy.get('[data-testid="menu-item-Firewalls"][href="/firewalls"]').should(
      'be.visible'
    );
    cy.get(
      '[data-testid="menu-item-StackScripts"][href="/stackscripts"]'
    ).should('be.visible');
    cy.get('[data-testid="menu-item-Images"][href="/images"]').should(
      'be.visible'
    );
    cy.get('[data-testid="menu-item-Domains"][href="/domains"]').should(
      'be.visible'
    );
    cy.get(
      '[data-testid="menu-item-Kubernetes"][href="/kubernetes/clusters"]'
    ).should('be.visible');
    cy.get(
      '[data-testid="menu-item-Object Storage"][href="/object-storage/buckets"]'
    ).should('be.visible');
    cy.get('[data-testid="menu-item-Longview"][href="/longview"]').should(
      'be.visible'
    );
    cy.get(
      '[data-testid="menu-item-Marketplace"][href="/linodes/create?type=One-Click"]'
    ).should('be.visible');
    cy.get('[data-testid="menu-item-Account"][href="/account"]').should(
      'be.visible'
    );
    cy.get('[data-testid="menu-item-Help & Support"][href="/support"]').should(
      'be.visible'
    );
  });

  it('checks the landing top menu items', () => {
    cy.wait('@getProfile').then((xhr) => {
      const username = xhr.response?.body.username;
      cy.get('[aria-label="open menu"]')
        .should('be.visible')
        .should('be.visible');
      cy.get('[data-qa-add-new-menu-button="true"]')
        .should('be.visible')
        .should('be.visible');
      cy.get('[data-qa-search-icon="true"]')
        .should('be.visible')
        .should('be.visible');
      cy.findByText('Search Products, IP Addresses, Tags...').should(
        'be.visible'
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

      cy.get('[aria-label="Notifications"]').should('be.visible');
      cy.get('[data-testid="nav-group-profile"]')
        .should('be.visible')
        .within(() => {
          cy.findByText(username).should('be.visible');
        });
    });
  });

  it('checks the landing labels and buttons', () => {
    cy.get('h1[data-qa-header="Linodes"]').should('be.visible');
    cy.get('a[aria-label="Docs - link opens in a new tab"]').should(
      'be.visible'
    );
    cy.findByText('Create Linode').should('be.visible');
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
      cy.get('tr[data-qa-loading="true"]')
        .should('be.visible')
        .first()
        .within(() => {
          cy.contains(label).should('be.visible');
        });
    };
    const checkLastRow = (label: string) => {
      cy.get('tr[data-qa-loading="true"]')
        .should('be.visible')
        .last()
        .within(() => {
          cy.contains(label).should('be.visible');
        });
    };

    checkFirstRow(firstLinodeLabel);
    checkLastRow(lastLinodeLabel);
    cy.get('[aria-label="Sort by label"]').click();
    checkFirstRow(lastLinodeLabel);
    checkLastRow(firstLinodeLabel);

    cy.get('[aria-label="Sort by region"]').click();
    checkFirstRow(firstRegionLabel);
    checkLastRow(lastRegionLabel);
    cy.get('[aria-label="Sort by region"]').click();
    checkFirstRow(lastRegionLabel);
    checkLastRow(firstRegionLabel);
  });

  it('checks the create menu dropdown items', () => {
    cy.get('[data-qa-add-new-menu-button="true"]').click();

    cy.get('[aria-labelledby="create-menu"]')
      .should('be.visible')
      .within(() => {
        cy.get('[href="/linodes/create"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Linode').should('be.visible');
            cy.findByText('High performance SSD Linux servers').should(
              'be.visible'
            );
          });

        cy.get('[href="/volumes/create"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Volume').should('be.visible');
            cy.findByText('Attach additional storage to your Linode').should(
              'be.visible'
            );
          });

        cy.get('[href="/nodebalancers/create"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('NodeBalancer').should('be.visible');
            cy.findByText('Ensure your services are highly available').should(
              'be.visible'
            );
          });

        cy.get('[href="/firewalls/create"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Firewall').should('be.visible');
            cy.findByText('Control network access to your Linodes').should(
              'be.visible'
            );
          });

        cy.get('[href="/firewalls/create"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Firewall').should('be.visible');
            cy.findByText('Control network access to your Linodes').should(
              'be.visible'
            );
          });

        cy.get('[href="/domains/create"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Domain').should('be.visible');
            cy.findByText('Manage your DNS records').should('be.visible');
          });

        cy.get('[href="/kubernetes/create"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Kubernetes').should('be.visible');
            cy.findByText('Highly available container workloads').should(
              'be.visible'
            );
          });

        cy.get('[href="/object-storage/buckets/create"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Bucket').should('be.visible');
            cy.findByText('S3-compatible object storage').should('be.visible');
          });

        cy.get('[href="/linodes/create?type=One-Click"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Marketplace').should('be.visible');
            cy.findByText('Deploy applications with ease').should('be.visible');
          });
      });
  });

  it('checks the table and action menu buttons/labels', () => {
    const label = linodeLabel(1);
    const ip = mockLinodes[0].ipv4[0];

    cy.get('[aria-label="Sort by label"]')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').should('be.visible');
      });

    cy.get('[aria-label="Sort by _statusPriority"]')
      .should('be.visible')
      .within(() => {
        cy.findByText('Status').should('be.visible');
      });
    cy.get('[aria-label="Sort by type"]')
      .should('be.visible')
      .within(() => {
        cy.findByText('Plan').should('be.visible');
      });
    cy.get('[aria-label="Sort by ipv4[0]"]')
      .should('be.visible')
      .within(() => {
        cy.findByText('Public IP Address').should('be.visible');
      });

    cy.get(`tr[data-qa-linode="${label}"]`)
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle(ip)
          .should('be.visible')
          .realHover()
          .then(() => {
            cy.get(`[aria-label="Copy ${ip} to clipboard"]`).should(
              'be.visible'
            );
          });
        cy.get(`[aria-label="Action menu for Linode ${label}"]`).should(
          'be.visible'
        );
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
    cy.get('[aria-label="Toggle group by tag"]')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.get('[data-qa-tag-header="even"]').should('be.visible');
    cy.get('[data-qa-tag-header="even"]').within(() => {
      mockLinodes.forEach((linode) => {
        if (linode.tags.includes('even')) {
          cy.findByText(linode.label).should('be.visible');
        } else {
          cy.findByText(linode.label).should('not.exist');
        }
      });
    });

    cy.get('[data-qa-tag-header="odd"]').should('be.visible');
    cy.get('[data-qa-tag-header="odd"]').within(() => {
      mockLinodes.forEach((linode) => {
        if (linode.tags.includes('odd')) {
          cy.findByText(linode.label).should('be.visible');
        } else {
          cy.findByText(linode.label).should('not.exist');
        }
      });
    });

    cy.get('[data-qa-tag-header="nums"]').should('be.visible');
    cy.get('[data-qa-tag-header="nums"]').within(() => {
      mockLinodes.forEach((linode) => {
        cy.findByText(linode.label).should('be.visible');
      });
    });

    // The linode landing table will resume when ungroup the tag.
    cy.get('[aria-label="Toggle group by tag"]')
      .should('be.visible')
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
    cy.get('[aria-label="Toggle display"]')
      .should('be.visible')
      .should('be.enabled')
      .click();
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
    cy.get('[aria-label="Toggle display"]')
      .should('be.visible')
      .should('be.enabled')
      .click();

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
    // Mock setup to display the Linode landing page in an non-empty state
    const mockLinodes: Linode[] = new Array(1).fill(null).map(
      (_item: null, index: number): Linode => {
        return linodeFactory.build({
          label: `Linode ${index}`,
          region: chooseRegion().id,
          tags: [index % 2 == 0 ? 'even' : 'odd', 'nums'],
        });
      }
    );

    mockGetLinodes(mockLinodes).as('getLinodes');

    // Alias the mockLinodes array
    cy.wrap(mockLinodes).as('mockLinodes');
  });

  it('checks restricted user with read access has no access to create linode and can see existing linodes', () => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
    // simulating a default user without the ability to add Linodes.
    const mockProfile = profileFactory.build({
      username: randomLabel(),
      restricted: true,
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_linodes: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);

    // Intercept and alias the mock requests
    cy.intercept('GET', apiMatcher('profile'), (req) => {
      req.reply(mockProfile);
    }).as('getProfile');

    cy.intercept('GET', apiMatcher('profile/grants'), (req) => {
      req.reply(mockGrants);
    }).as('getProfileGrants');

    // Login and wait for application to load
    cy.visitWithLogin(routes.linodeLanding);
    cy.wait('@getLinodes');
    cy.url().should('endWith', routes.linodeLanding);

    // Wait for the mock requests to complete
    cy.wait('@getProfile');
    cy.wait('@getProfileGrants');

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

    // Assert that List of Liondes table exist
    cy.get('table[aria-label="List of Linodes"]').should('exist');

    // Assert that Docs link exist
    cy.get(
      'a[aria-label="Docs - link opens in a new tab"][data-testid="external-link"]'
    ).should('exist');

    // Assert that the correct number of Linode entries are present in the table
    cy.get<Linode[]>('@mockLinodes').then((mockLinodes) => {
      // Assert that the correct number of Linode entries are present in the table
      cy.get('table[aria-label="List of Linodes"] tbody tr').should(
        'have.length',
        mockLinodes.length
      );

      // Assert that each Linode entry is present in the table
      mockLinodes.forEach((linode) => {
        cy.get('table[aria-label="List of Linodes"] tbody tr').should(
          'contain',
          linode.label
        );
      });
    });
  });
});
