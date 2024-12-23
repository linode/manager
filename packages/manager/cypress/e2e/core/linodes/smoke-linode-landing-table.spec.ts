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
import {
  sideMenuAkamaiDashboard,
  sideMenuItemsLocator,
  topMenuItemsLocator,
  createMenuTopMenuItemsLocator,
} from 'support/ui/locators/common-locators';
import {
  emptyLinodePage,
  nonEmptyLinodePage,
  listOfLinodesTableHeader,
  listOfLinodesTableBody,
  listOfLinodesTableTagsBody,
  summaryViewLinodeDetails,
  errorMessage,
} from 'support/ui/locators/linode-locators';
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
    getVisible(sideMenuAkamaiDashboard);
    getVisible(sideMenuItemsLocator.linodesLink);
    getVisible(sideMenuItemsLocator.volumesLink);
    getVisible(sideMenuItemsLocator.nodeBalancersLink);
    getVisible(sideMenuItemsLocator.firewallsLink);
    getVisible(sideMenuItemsLocator.stackScriptsLink);
    getVisible(sideMenuItemsLocator.imagesLink);
    getVisible(sideMenuItemsLocator.domainsLink);
    getVisible(sideMenuItemsLocator.kubernatesLink);
    getVisible(sideMenuItemsLocator.bucketLink);
    getVisible(sideMenuItemsLocator.longviewLink);
    getVisible(sideMenuItemsLocator.marketplaceOneClickLink);
    getVisible(sideMenuItemsLocator.accountLink);
    getVisible(sideMenuItemsLocator.supportLink);
  });

  it('checks the landing top menu items', () => {
    cy.wait('@getProfile').then((xhr) => {
      const username = xhr.response?.body.username;
      getVisible(topMenuItemsLocator.toggleSideMenuButton);
      getVisible(topMenuItemsLocator.addNewMenuButton);
      getVisible(topMenuItemsLocator.searchIcon);
      fbtVisible(topMenuItemsLocator.searchInput);

      cy.findByLabelText(topMenuItemsLocator.helpAndSupportLink)
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.url().should('endWith', '/support');
      cy.go('back');

      // Cypress cannot work with other tabs and windows, so we can't test
      // that this takes the user to the expected place since it has no `href`
      // attribute.
      cy.findByLabelText(topMenuItemsLocator.linodeCloudCommunityLink)
        .should('be.visible')
        .should('be.enabled');

      getVisible(topMenuItemsLocator.notificationsButton);
      getVisible(topMenuItemsLocator.navProfileButton).within(() => {
        fbtVisible(username);
      });
    });
  });

  it('checks the landing labels and buttons', () => {
    getVisible(nonEmptyLinodePage.linodesLabel);
    getVisible(nonEmptyLinodePage.docsLink);
    fbtVisible(nonEmptyLinodePage.createLinodeButton);
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
      getVisible(listOfLinodesTableBody.rows)
        .first()
        .within(() => {
          containsVisible(label);
        });
    };
    const checkLastRow = (label: string) => {
      getVisible(listOfLinodesTableBody.rows)
        .last()
        .within(() => {
          containsVisible(label);
        });
    };

    checkFirstRow(firstLinodeLabel);
    checkLastRow(lastLinodeLabel);
    getClick(listOfLinodesTableHeader.labelSortButton);
    checkFirstRow(lastLinodeLabel);
    checkLastRow(firstLinodeLabel);

    getClick(listOfLinodesTableHeader.regionSortButton);
    checkFirstRow(firstRegionLabel);
    checkLastRow(lastRegionLabel);
    getClick(listOfLinodesTableHeader.regionSortButton);
    checkFirstRow(lastRegionLabel);
    checkLastRow(firstRegionLabel);
  });

  it('checks the create menu dropdown items', () => {
    getClick(topMenuItemsLocator.addNewMenuButton);

    getVisible(createMenuTopMenuItemsLocator.createMenu).within(() => {
      getVisible(createMenuTopMenuItemsLocator.linodesLink).within(() => {
        fbtVisible('Linode');
        fbtVisible('High performance SSD Linux servers');
      });

      getVisible(createMenuTopMenuItemsLocator.volumesLink).within(() => {
        fbtVisible('Volume');
        fbtVisible('Attach additional storage to your Linode');
      });

      getVisible(createMenuTopMenuItemsLocator.nodeBalancersLink).within(() => {
        fbtVisible('NodeBalancer');
        fbtVisible('Ensure your services are highly available');
      });

      getVisible(createMenuTopMenuItemsLocator.firewallsLink).within(() => {
        fbtVisible('Firewall');
        fbtVisible('Control network access to your Linodes');
      });

      getVisible(createMenuTopMenuItemsLocator.domainsLink).within(() => {
        fbtVisible('Domain');
        fbtVisible('Manage your DNS records');
      });

      getVisible(createMenuTopMenuItemsLocator.kubernetesLink).within(() => {
        fbtVisible('Kubernetes');
        fbtVisible('Highly available container workloads');
      });

      getVisible(createMenuTopMenuItemsLocator.bucketsLink).within(() => {
        fbtVisible('Bucket');
        fbtVisible('S3-compatible object storage');
      });

      getVisible(createMenuTopMenuItemsLocator.marketplaceOneClickLink).within(
        () => {
          fbtVisible('Marketplace');
          fbtVisible('Deploy applications with ease');
        }
      );
    });
  });

  it('checks the table and action menu buttons/labels', () => {
    const label = linodeLabel(1);
    const ip = mockLinodes[0].ipv4[0];

    getVisible(listOfLinodesTableHeader.labelSortButton).within(() => {
      fbtVisible('Label');
    });

    getVisible(listOfLinodesTableHeader.statusPrioritySortButton).within(() => {
      fbtVisible('Status');
    });
    getVisible(listOfLinodesTableHeader.typeSortButton).within(() => {
      fbtVisible('Plan');
    });
    getVisible(listOfLinodesTableHeader.ipv4SortButton).within(() => {
      fbtVisible('Public IP Address');
    });

    getVisible(listOfLinodesTableBody.rowByLabel(label)).within(() => {
      ui.button
        .findByTitle(ip)
        .should('be.visible')
        .realHover()
        .then(() => {
          getVisible(listOfLinodesTableBody.ipClipboardCopyButton(ip));
        });
      getVisible(listOfLinodesTableBody.linodeActionMenu(label));
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
      .findByTitle(listOfLinodesTableBody.linodeActionMenuButton(label))
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
    getVisible(listOfLinodesTableHeader.toggleGroupByTagButton)
      .should('be.enabled')
      .click();
    getVisible(listOfLinodesTableTagsBody.evenTag);
    cy.get(listOfLinodesTableTagsBody.evenTag).within(() => {
      mockLinodes.forEach((linode) => {
        if (linode.tags.includes('even')) {
          cy.findByText(linode.label).should('be.visible');
        } else {
          cy.findByText(linode.label).should('not.exist');
        }
      });
    });

    getVisible(listOfLinodesTableTagsBody.oddTag);
    cy.get(listOfLinodesTableTagsBody.oddTag).within(() => {
      mockLinodes.forEach((linode) => {
        if (linode.tags.includes('odd')) {
          cy.findByText(linode.label).should('be.visible');
        } else {
          cy.findByText(linode.label).should('not.exist');
        }
      });
    });

    getVisible(listOfLinodesTableTagsBody.numTag);
    cy.get(listOfLinodesTableTagsBody.numTag).within(() => {
      mockLinodes.forEach((linode) => {
        cy.findByText(linode.label).should('be.visible');
      });
    });

    // The linode landing table will resume when ungroup the tag.
    getVisible(listOfLinodesTableHeader.toggleGroupByTagButton)
      .should('be.enabled')
      .click();
    cy.get(listOfLinodesTableTagsBody.evenTag).should('not.exist');
    cy.get(listOfLinodesTableTagsBody.oddTag).should('not.exist');
    cy.get(listOfLinodesTableTagsBody.numTag).should('not.exist');
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
    getVisible(listOfLinodesTableHeader.toggleDisplayButton)
      .should('be.enabled')
      .click();
    cy.wait('@updateUserPreferences');

    mockLinodes.forEach((linode) => {
      cy.findByText(linode.label)
        .should('be.visible')
        .closest(summaryViewLinodeDetails.linodesConatiner)
        .within(() => {
          cy.findByText(summaryViewLinodeDetails.summaryLabel).should(
            'be.visible'
          );
          cy.findByText(summaryViewLinodeDetails.publicIpAddresLabel).should(
            'be.visible'
          );
          cy.findByText(summaryViewLinodeDetails.accessLabel).should(
            'be.visible'
          );

          cy.findByText(summaryViewLinodeDetails.planLabel).should(
            'be.visible'
          );
          cy.findByText(summaryViewLinodeDetails.regionLabel).should(
            'be.visible'
          );
          cy.findByText(summaryViewLinodeDetails.linodeIdLabel).should(
            'be.visible'
          );
          cy.findByText(summaryViewLinodeDetails.createdLabel).should(
            'be.visible'
          );
        });
    });

    // Toggle the 'List View' button to check the display of table items are back to the original view.
    getVisible(listOfLinodesTableHeader.toggleDisplayButton)
      .should('be.enabled')
      .click();

    cy.findByText(summaryViewLinodeDetails.summaryLabel).should('not.exist');
    cy.findByText(summaryViewLinodeDetails.publicIpAddresLabel).should(
      'not.exist'
    );
    cy.findByText(summaryViewLinodeDetails.accessLabel).should('not.exist');

    cy.findByText(summaryViewLinodeDetails.planLabel).should('not.exist');
    cy.findByText(summaryViewLinodeDetails.regionLabel).should('not.exist');
    cy.findByText(summaryViewLinodeDetails.linodeIdLabel).should('not.exist');
    cy.findByText(summaryViewLinodeDetails.createdLabel).should('not.exist');
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
    cy.get(emptyLinodePage.resourcesContainer).as('resourcesSection');
    cy.get('@resourcesSection')
      .get(emptyLinodePage.resourcesHeader1)
      .contains('Linodes')
      .as('linodesHeader');

    // Assert that fields with Linodes and Cloud-based virtual machines text are visible
    cy.get('@linodesHeader').should('be.visible');
    cy.get('@linodesHeader')
      .next(emptyLinodePage.resourcesHeader2)
      .should('be.visible')
      .should('have.text', 'Cloud-based virtual machines');

    //Assert that recommended section is visible - Getting Started Guides, Deploy an App and Video Playlist
    cy.get('@resourcesSection')
      .contains(emptyLinodePage.resourcesHeader2, 'Getting Started Guides')
      .should('be.visible');
    cy.get('@resourcesSection')
      .contains(emptyLinodePage.resourcesHeader2, 'Deploy an App')
      .should('be.visible');
    cy.get('@resourcesSection')
      .contains(emptyLinodePage.resourcesHeader2, 'Video Playlist')
      .should('be.visible');

    // Assert that Create Linode button is visible and enabled
    ui.button
      .findByTitle(emptyLinodePage.createLinodeButton)
      .should('be.visible')
      .and('be.enabled');

    // Assert that List of Liondes table does not exist
    cy.get(nonEmptyLinodePage.listOfLinodesTable).should('not.exist');

    // Assert that Docs link does not exist
    cy.get(nonEmptyLinodePage.docsLink).should('not.exist');

    // Assert that Download CSV button does not exist
    cy.get(nonEmptyLinodePage.downloadCsvButton)
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
      .findByTitle(emptyLinodePage.createLinodeButton)
      .should('be.visible')
      .and('be.disabled')
      .trigger('mouseover');

    // Assert that tooltip is visible with message
    ui.tooltip
      .findByText(errorMessage.restrictedUserTooltip)
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
      .findByTitle(nonEmptyLinodePage.createLinodeButton)
      .should('be.visible')
      .and('be.disabled')
      .trigger('mouseover');

    // Assert that tooltip is visible with message
    ui.tooltip
      .findByText(errorMessage.restrictedUserTooltip)
      .should('be.visible');

    // Assert that List of Liondes table exist
    cy.get(nonEmptyLinodePage.listOfLinodesTable).should('exist');

    // Assert that Docs link exist
    cy.get(nonEmptyLinodePage.docsLink).should('exist');

    // Assert that the correct number of Linode entries are present in the table
    cy.get<Linode[]>('@mockLinodes').then((mockLinodes) => {
      // Assert that the correct number of Linode entries are present in the table
      cy.get(listOfLinodesTableBody.rows).should(
        'have.length',
        mockLinodes.length
      );

      // Assert that each Linode entry is present in the table
      mockLinodes.forEach((linode) => {
        cy.get(listOfLinodesTableBody.rows).should('contain', linode.label);
      });
    });
  });
});
