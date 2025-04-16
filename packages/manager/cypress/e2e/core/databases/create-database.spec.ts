import { grantsFactory, profileFactory } from '@linode/utilities';
import {
  databaseConfigurations,
  mockDatabaseEngineTypes,
  mockDatabaseNodeTypes,
} from 'support/constants/databases';
import { mockGetAccount, mockGetUser } from 'support/intercepts/account';
import {
  mockCreateDatabase,
  mockGetDatabaseEngines,
  mockGetDatabases,
  mockGetDatabaseTypes,
} from 'support/intercepts/databases';
import { mockGetEvents } from 'support/intercepts/events';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { getRegionById } from 'support/util/regions';

import {
  accountFactory,
  accountUserFactory,
  databaseFactory,
  eventFactory,
} from 'src/factories';

import type { Database } from '@linode/api-v4';
import type { DatabaseClusterConfiguration } from 'support/constants/databases';

describe('create a database cluster, mocked data', () => {
  databaseConfigurations.forEach(
    (configuration: DatabaseClusterConfiguration) => {
      // @TODO Add assertions for DBaaS pricing.
      it(`creates a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
        // Database mock immediately after instance has been created.
        const databaseMock: Database = databaseFactory.build({
          cluster_size: configuration.clusterSize,
          engine: configuration.dbType,
          hosts: {
            primary: undefined,
            secondary: undefined,
          },
          label: configuration.label,
          region: configuration.region.id,
          status: 'provisioning',
          type: configuration.linodeType,
          version: configuration.version,
        });

        // Database mock once instance has been provisioned.
        const databaseMockActive: Database = {
          ...databaseMock,
          status: 'active',
        };

        const databaseRegionLabel = getRegionById(databaseMock.region).label;

        // Event mock which will trigger Cloud to re-fetch DBaaS instance.
        const eventMock = eventFactory.build({
          action: 'database_create',
          entity: {
            id: databaseMock.id,
            label: databaseMock.label,
            type: 'database',
            url: `/v4/databases/${configuration.dbType}/instances/${databaseMock.id}`,
          },
          percent_complete: 100,
          secondary_entity: undefined,
          status: 'finished',
        });

        const clusterSizeSelection =
          configuration.clusterSize > 1 ? '3 Nodes' : '1 Node';

        const clusterCpuType =
          configuration.linodeType.indexOf('-dedicated-') !== -1
            ? 'Dedicated CPU'
            : 'Shared CPU';

        // Mock account to ensure 'Managed Databases' capability.
        mockGetAccount(accountFactory.build()).as('getAccount');
        mockGetDatabaseEngines(mockDatabaseEngineTypes).as(
          'getDatabaseEngines'
        );
        mockCreateDatabase(databaseMock).as('createDatabase');
        mockGetDatabases([databaseMock]).as('getDatabases');
        mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');

        cy.visitWithLogin('/databases/create');
        cy.wait(['@getAccount', '@getDatabaseEngines', '@getDatabaseTypes']);

        ui.entityHeader
          .find()
          .should('be.visible')
          .within(() => {
            cy.findByText('Create').should('be.visible');
          });

        cy.findByText('Cluster Label').should('be.visible').click();
        cy.focused().type(configuration.label);

        cy.findByText('Database Engine').should('be.visible').click();
        cy.focused().type(
          `${configuration.engine} v${configuration.version}{enter}`
        );

        ui.regionSelect.find().click();
        cy.focused().type(`${databaseRegionLabel}{enter}`);

        // Click either the "Dedicated CPU" or "Shared CPU" tab, according
        // to the type of cluster being created.
        cy.findByText(clusterCpuType).should('be.visible').click();

        cy.get(`[id="${configuration.linodeType}"]`).click();

        // Database cluster size selection.
        cy.contains(clusterSizeSelection).should('be.visible').click();

        // Create database, confirm redirect, and that new instance is listed.
        cy.findByText('Create Database Cluster').should('be.visible').click();
        cy.wait('@createDatabase');

        // TODO Update assertions upon completion of M3-7030.
        cy.url().should(
          'endWith',
          `/databases/${databaseMock.engine}/${databaseMock.id}`
        );

        cy.findByText(databaseMock.label).should('be.visible');
        cy.findByText(databaseRegionLabel).should('be.visible');

        // Navigate back to landing page.
        ui.entityHeader.find().within(() => {
          cy.findByText('Database Clusters').should('be.visible').click();
        });

        cy.url().should('endWith', '/databases');

        cy.wait('@getDatabases');

        cy.findByText(databaseMock.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText(`${configuration.engine} v${configuration.version}`, {
              exact: false,
            }).should('be.visible');
            cy.findByText(configuration.region.label, {
              exact: false,
            }).should('be.visible');
          });

        // Mock next request to fetch databases so that instance appears active.
        // Mock next event request to trigger Cloud to re-fetch DBaaS instances.
        mockGetDatabases([databaseMockActive]).as('getDatabases');
        mockGetEvents([eventMock]).as('getEvents');
        cy.wait(['@getEvents', '@getDatabases']);

        cy.findByText(databaseMock.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('Active').should('be.visible');
          });
      });
    }
  );
});

describe('restricted user cannot create database', () => {
  beforeEach(() => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
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
        add_databases: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);
    mockGetDatabases([]).as('getDatabases');
  });
  it('cannot create database on landing page', () => {
    // Login and wait for application to load
    cy.visitWithLogin('/databases');
    cy.wait('@getDatabases');
    // Assert that Create Database button is visible and disabled
    ui.button
      .findByTitle('Create Database Cluster')
      .should('be.visible')
      .and('be.disabled')
      .trigger('mouseover');

    // Assert that tooltip is visible with message
    ui.tooltip
      .findByText(
        "You don't have permissions to create Databases. Please contact your account administrator to request the necessary permissions."
      )
      .should('be.visible');

    // table not present for restricted user
    cy.get('table[aria-label="Database Clusters"]').should('not.exist');
    // link to Docs should exist
    cy.findByText('Getting Started Guides').should('be.visible');
    cy.findByText('Video Playlist').should('be.visible');
  });

  it('cannot create database from Create menu', () => {
    // Login and wait for application to load
    cy.visitWithLogin('/databases/create');

    // table present for restricted user but its inputs will be disabled
    cy.get('table[aria-label="List of Linode Plans"]').should('exist');
    // Assert that Create Database button is visible and disabled
    ui.button
      .findByTitle('Create Database Cluster')
      .should('be.visible')
      .and('be.disabled')
      .trigger('mouseover');

    // Info message is visible
    cy.findByText(
      "You don't have permissions to create this Database. Please contact your account administrator to request the necessary permissions."
    );

    // all form inputs are disabled
    cy.get('[data-testid="db-create-form"]').within(() => {
      cy.get('input').each((input) => {
        cy.wrap(input).should('be.disabled');
      });
    });
  });
});
