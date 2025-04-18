/* eslint-disable sonarjs/no-duplicate-string */
import {
  grantsFactory,
  linodeFactory,
  profileFactory,
  userPreferencesFactory,
} from '@linode/utilities';
import { accountSettingsFactory } from '@src/factories/accountSettings';
import { accountUserFactory } from '@src/factories/accountUsers';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { authenticate } from 'support/api/authentication';
import { mockGetUser } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodeFirewalls,
  mockGetLinodes,
} from 'support/intercepts/linodes';
import {
  mockGetProfile,
  mockGetProfileGrants,
  mockGetUserPreferences,
  mockUpdateUserPreferences,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { routes } from 'support/ui/constants';
import * as commonLocators from 'support/ui/locators/common-locators';
import * as linodeLocators from 'support/ui/locators/linode-locators';
import { apiMatcher } from 'support/util/intercepts';
import { randomLabel } from 'support/util/random';
import { chooseRegion, getRegionById } from 'support/util/regions';

import type { Linode } from '@linode/api-v4';

const mockLinodes = new Array(5)
  .fill(null)
  .map((_item: null, index: number): Linode => {
    return linodeFactory.build({
      label: `Linode ${index}`,
      region: chooseRegion().id,
      tags: [index % 2 == 0 ? 'even' : 'odd', 'nums'],
    });
  });

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
describe('linode landing checks', () => {
  beforeEach(() => {
    const mockAccountSettings = accountSettingsFactory.build({
      managed: false,
    });

    cy.intercept('GET', apiMatcher('account/settings'), (req) => {
      req.reply(mockAccountSettings);
    }).as('getAccountSettings');
    cy.intercept('GET', apiMatcher('profile')).as('getProfile');
    cy.intercept('GET', apiMatcher('linode/instances*'), (req) => {
      req.reply(mockLinodesData);
    }).as('getLinodes');
    cy.visitWithLogin('/', { preferenceOverrides });
    cy.wait('@getAccountSettings');
    cy.wait('@getLinodes');
    cy.url().should('endWith', routes.linodeLanding);
  });

  it('checks the landing page side menu items', () => {
    cy.findByTitle('Akamai - Dashboard').should('be.visible');
    cy.findByTestId('menu-item-Linodes').should('be.visible');
    cy.findByTestId('menu-item-Volumes').should('be.visible');
    cy.findByTestId('menu-item-NodeBalancers').should('be.visible');
    cy.findByTestId('menu-item-Firewalls').should('be.visible');
    cy.findByTestId('menu-item-StackScripts').should('be.visible');
    cy.findByTestId('menu-item-Images').should('be.visible');
    cy.findByTestId('menu-item-Domains').should('be.visible');
    cy.findByTestId('menu-item-Kubernetes').should('be.visible');
    cy.findByTestId('menu-item-Object Storage').should('be.visible');
    cy.findByTestId('menu-item-Longview').should('be.visible');
    cy.findByTestId('menu-item-Marketplace').should('be.visible');
    cy.findByTestId('menu-item-Account').scrollIntoView();
    cy.findByTestId('menu-item-Account').should('be.visible');
    cy.findByTestId('menu-item-Help & Support').should('be.visible');
  });

  it('checks the landing top menu items', () => {
    cy.wait('@getProfile').then((xhr) => {
      const username = xhr.response?.body.username;
      cy.get(commonLocators.topMenuItemsLocator.toggleSideMenuButton).should(
        'be.visible'
      );
      cy.get(commonLocators.topMenuItemsLocator.addNewMenuButton).should(
        'be.visible'
      );
      cy.get(commonLocators.topMenuItemsLocator.searchIcon).should(
        'be.visible'
      );
      ui.mainSearch.find().should('be.visible');

      cy.findByTestId('top-menu-help-and-support')
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

      cy.get(commonLocators.topMenuItemsLocator.notificationsButton).should(
        'be.visible'
      );
      cy.findByTestId('nav-group-profile')
        .should('be.visible')
        .within(() => {
          cy.findByText(username).should('be.visible');
        });
    });
  });

  it('checks the landing labels and buttons', () => {
    cy.get(linodeLocators.nonEmptyLinodePage.linodesLabel).should('be.visible');
    cy.get(linodeLocators.nonEmptyLinodePage.docsLink).should('be.visible');
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
      cy.get(linodeLocators.listOfLinodesTableBody.rows)
        .should('be.visible')
        .first()
        .within(() => {
          cy.contains(label).should('be.visible');
        });
    };
    const checkLastRow = (label: string) => {
      cy.get(linodeLocators.listOfLinodesTableBody.rows)
        .should('be.visible')
        .last()
        .within(() => {
          cy.contains(label).should('be.visible');
        });
    };

    checkFirstRow(firstLinodeLabel);
    checkLastRow(lastLinodeLabel);
    cy.get(linodeLocators.listOfLinodesTableHeader.labelSortButton).click();
    checkFirstRow(lastLinodeLabel);
    checkLastRow(firstLinodeLabel);

    // Region sorting ascending order
    cy.get(linodeLocators.listOfLinodesTableHeader.regionSortButton).click();
    checkFirstRow(firstRegionLabel);
    checkLastRow(lastRegionLabel);

    // Region sorting descending order
    cy.get(linodeLocators.listOfLinodesTableHeader.regionSortButton).click();
    checkFirstRow(lastRegionLabel);
    checkLastRow(firstRegionLabel);
  });

  it('checks the create menu dropdown items', () => {
    cy.get(commonLocators.topMenuItemsLocator.addNewMenuButton).click();

    cy.get(commonLocators.topMenuCreateItemsLocator.createMenu)
      .should('be.visible')
      .within(() => {
        cy.get(commonLocators.topMenuCreateItemsLocator.linodesLink)
          .should('be.visible')
          .within(() => {
            cy.findByText('Linode').should('be.visible');
            cy.findByText('High performance SSD Linux servers').should(
              'be.visible'
            );
          });

        cy.get(commonLocators.topMenuCreateItemsLocator.volumesLink)
          .should('be.visible')
          .within(() => {
            cy.findByText('Volume').should('be.visible');
            cy.findByText('Attach additional storage to your Linode').should(
              'be.visible'
            );
          });

        cy.get(commonLocators.topMenuCreateItemsLocator.nodeBalancersLink)
          .should('be.visible')
          .within(() => {
            cy.findByText('NodeBalancer').should('be.visible');
            cy.findByText('Ensure your services are highly available').should(
              'be.visible'
            );
          });

        cy.get(commonLocators.topMenuCreateItemsLocator.firewallsLink)
          .should('be.visible')
          .within(() => {
            cy.findByText('Firewall').should('be.visible');
            cy.findByText('Control network access to your Linodes').should(
              'be.visible'
            );
          });

        cy.get(commonLocators.topMenuCreateItemsLocator.domainsLink)
          .should('be.visible')
          .within(() => {
            cy.findByText('Domain').should('be.visible');
            cy.findByText('Manage your DNS records').should('be.visible');
          });

        cy.get(commonLocators.topMenuCreateItemsLocator.kubernetesLink)
          .should('be.visible')
          .within(() => {
            cy.findByText('Kubernetes').should('be.visible');
            cy.findByText('Highly available container workloads').should(
              'be.visible'
            );
          });

        cy.get(commonLocators.topMenuCreateItemsLocator.bucketsLink)
          .should('be.visible')
          .within(() => {
            cy.findByText('Bucket').should('be.visible');
            cy.findByText('S3-compatible object storage').should('be.visible');
          });

        cy.get(commonLocators.topMenuCreateItemsLocator.marketplaceOneClickLink)
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

    cy.get(linodeLocators.listOfLinodesTableHeader.labelSortButton)
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').should('be.visible');
      });

    cy.get(linodeLocators.listOfLinodesTableHeader.statusPrioritySortButton)
      .should('be.visible')
      .within(() => {
        cy.findByText('Status').should('be.visible');
      });
    cy.get(linodeLocators.listOfLinodesTableHeader.typeSortButton)
      .should('be.visible')
      .within(() => {
        cy.findByText('Plan').should('be.visible');
      });
    cy.get(linodeLocators.listOfLinodesTableHeader.ipv4SortButton)
      .should('be.visible')
      .within(() => {
        cy.findByText('Public IP Address').should('be.visible');
      });

    cy.get(linodeLocators.listOfLinodesTableBody.rowByLabel(label))
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle(ip)
          .should('be.visible')
          .realHover()
          .then(() => {
            cy.get(
              linodeLocators.listOfLinodesTableBody.ipClipboardCopyButton(ip)
            ).should('be.visible');
          });
        cy.get(
          linodeLocators.listOfLinodesTableBody.linodeActionMenu(label)
        ).should('be.visible');
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
    cy.get(linodeLocators.listOfLinodesTableHeader.toggleGroupByTagButton)
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.get(linodeLocators.listOfLinodesTableTagsBody.evenTag).should(
      'be.visible'
    );
    cy.get(linodeLocators.listOfLinodesTableTagsBody.evenTag).within(() => {
      mockLinodes.forEach((linode) => {
        if (linode.tags.includes('even')) {
          cy.findByText(linode.label).should('be.visible');
        } else {
          cy.findByText(linode.label).should('not.exist');
        }
      });
    });

    cy.get(linodeLocators.listOfLinodesTableTagsBody.oddTag).should(
      'be.visible'
    );
    cy.get(linodeLocators.listOfLinodesTableTagsBody.oddTag).within(() => {
      mockLinodes.forEach((linode) => {
        if (linode.tags.includes('odd')) {
          cy.findByText(linode.label).should('be.visible');
        } else {
          cy.findByText(linode.label).should('not.exist');
        }
      });
    });

    cy.get(linodeLocators.listOfLinodesTableTagsBody.numTag).should(
      'be.visible'
    );
    cy.get(linodeLocators.listOfLinodesTableTagsBody.numTag).within(() => {
      mockLinodes.forEach((linode) => {
        cy.findByText(linode.label).should('be.visible');
      });
    });

    // The linode landing table will resume when ungroup the tag.
    cy.get(linodeLocators.listOfLinodesTableHeader.toggleGroupByTagButton)
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.get(linodeLocators.listOfLinodesTableTagsBody.evenTag).should(
      'not.exist'
    );
    cy.get(linodeLocators.listOfLinodesTableTagsBody.oddTag).should(
      'not.exist'
    );
    cy.get(linodeLocators.listOfLinodesTableTagsBody.numTag).should(
      'not.exist'
    );
    mockLinodes.forEach((linode) => {
      cy.findByText(linode.label).should('be.visible');
    });
  });

  it('checks summary view for linode table', () => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: false },
    });

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

    mockLinodes.forEach((linode) => {
      mockGetLinodeFirewalls(linode.id, []);
    });

    cy.visitWithLogin('/linodes');
    cy.wait(['@getLinodes', '@getUserPreferences']);

    // Check 'Summary View' button works as expected that can be visiable, enabled and clickable
    cy.get(linodeLocators.listOfLinodesTableHeader.toggleDisplayButton)
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
    cy.get(linodeLocators.listOfLinodesTableHeader.toggleDisplayButton)
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
    cy.get(linodeLocators.emptyLinodePage.resourcesContainer).as(
      'resourcesSection'
    );
    cy.get('@resourcesSection')
      .get(linodeLocators.emptyLinodePage.resourcesHeader1)
      .contains('Linodes')
      .as('linodesHeader');

    // Assert that fields with Linodes and Cloud-based virtual machines text are visible
    cy.get('@linodesHeader').should('be.visible');
    cy.get('@linodesHeader')
      .next('h2')
      .should('be.visible')
      .should('have.text', 'Cloud-based virtual machines');

    // Assert that recommended section is visible - Getting Started Guides, Deploy an App and Video Playlist
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
    cy.get(linodeLocators.nonEmptyLinodePage.listOfLinodesTable).should(
      'not.exist'
    );

    // Assert that Docs link does not exist
    cy.get(linodeLocators.nonEmptyLinodePage.docsLink).should('not.exist');

    // Assert that Download CSV button does not exist
    cy.get('button').contains('Download CSV').should('not.exist');
  });

  it('checks restricted user has no access to create linode on linode landing page', () => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
    // simulating a default user without the ability to add Linodes.
    const mockProfile = profileFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      restricted: true,
      user_type: 'default',
      username: mockProfile.username,
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
    const mockLinodes: Linode[] = new Array(1)
      .fill(null)
      .map((_item: null, index: number): Linode => {
        return linodeFactory.build({
          label: `Linode ${index}`,
          region: chooseRegion().id,
          tags: [index % 2 == 0 ? 'even' : 'odd', 'nums'],
        });
      });

    mockGetLinodes(mockLinodes).as('getLinodes');

    // Alias the mockLinodes array
    cy.wrap(mockLinodes).as('mockLinodes');
  });

  it('checks restricted user with read access has no access to create linode and can see existing linodes', () => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
    // simulating a default user without the ability to add Linodes.
    const mockProfile = profileFactory.build({
      restricted: true,
      username: randomLabel(),
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

    // Assert that Download CSV button does exist
    cy.get('button').contains('Download CSV').should('exist');

    // Assert that tooltip is visible with message
    ui.tooltip
      .findByText(
        "You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions."
      )
      .should('be.visible');

    // Assert that List of Liondes table exist
    cy.get(linodeLocators.nonEmptyLinodePage.listOfLinodesTable).should(
      'exist'
    );

    // Assert that Docs link exist
    cy.get(linodeLocators.nonEmptyLinodePage.docsLink).should('exist');

    // Assert that the correct number of Linode entries are present in the table
    cy.get<Linode[]>('@mockLinodes').then((mockLinodes) => {
      // Assert that the correct number of Linode entries are present in the table
      cy.get(linodeLocators.listOfLinodesTableBody.rows).should(
        'have.length',
        mockLinodes.length
      );

      // Assert that each Linode entry is present in the table
      mockLinodes.forEach((linode) => {
        cy.get(linodeLocators.listOfLinodesTableBody.rows).should(
          'contain',
          linode.label
        );
      });
    });
  });
});
