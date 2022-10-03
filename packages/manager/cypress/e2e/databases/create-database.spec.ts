import { ClusterSize, Engine } from '@linode/api-v4/lib/databases/types';
import { databaseInstanceFactory } from 'src/factories/databases';
import { eventFactory } from 'src/factories/events';
import { randomLabel } from 'support/util/random';
import { sequentialStub } from 'support/stubs/sequential-stub';
import { paginateResponse } from 'support/util/paginate';
import { containsClick, fbtClick, getClick } from 'support/helpers';

interface databaseClusterConfiguration {
  label: string;
  linodeType: string;
  clusterSize: ClusterSize;
  dbType: Engine;
  regionTypeahead: string;
  region: string;
  engine: string;
  version: string;
}

// Array of database cluster configurations for which to test creation.
const databaseConfigurations: databaseClusterConfiguration[] = [
  {
    label: randomLabel(),
    linodeType: 'g6-nanode-1',
    clusterSize: 1,
    dbType: 'mysql',
    regionTypeahead: 'Newark',
    region: 'us-east',
    engine: 'MySQL',
    version: '8.0.26',
  },
  {
    label: randomLabel(),
    linodeType: 'g6-dedicated-16',
    clusterSize: 3,
    dbType: 'mysql',
    regionTypeahead: 'Atlanta',
    region: 'us-southeast',
    engine: 'MySQL',
    version: '5.7.30',
  },
  // {
  //   label: randomLabel(),
  //   linodeType: 'g6-dedicated-16',
  //   clusterSize: 1,
  //   dbType: 'mongodb',
  //   regionTypeahead: 'Atlanta',
  //   region: 'us-southeast',
  //   engine: 'MongoDB',
  //   version: '4.4.10',
  // },
  {
    label: randomLabel(),
    linodeType: 'g6-nanode-1',
    clusterSize: 3,
    dbType: 'postgresql',
    regionTypeahead: 'Newark',
    region: 'us-east',
    engine: 'PostgreSQL',
    version: '13.2',
  },
];

describe('create a database cluster, mocked data', () => {
  databaseConfigurations.forEach(
    (configuration: databaseClusterConfiguration) => {
      // @TODO Add assertions for DBaaS pricing.
      it(`creates a ${configuration.linodeType} ${configuration.engine} v${configuration.version} ${configuration.clusterSize}-node cluster at ${configuration.region}`, () => {
        const databaseMock = databaseInstanceFactory.build({
          label: configuration.label,
          type: configuration.linodeType,
          region: configuration.region,
          version: configuration.version,
          status: 'provisioning',
          cluster_size: configuration.clusterSize,
          engine: configuration.dbType,
          hosts: {
            primary: undefined,
            secondary: undefined,
          },
        });

        const eventMock = eventFactory.build({
          status: 'finished',
          action: 'database_create',
          percent_complete: 100,
          entity: {
            label: databaseMock.label,
            id: databaseMock.id,
            type: 'database',
            url: `/v4/databases/${configuration.dbType}/instances/${databaseMock.id}`,
          },
          secondary_entity: undefined,
        });

        cy.intercept(
          'POST',
          `*/databases/${configuration.dbType}/instances`,
          databaseMock
        ).as('createDatabase');

        cy.intercept(
          'GET',
          '*/databases/instances?page=1&page_size=25',
          sequentialStub([
            paginateResponse(databaseMock),
            paginateResponse({ ...databaseMock, status: 'active' }),
          ])
        ).as('listDatabases');

        cy.visitWithLogin('/databases/create');
        cy.get('[data-qa-header="Create"]').should('have.text', 'Create');

        containsClick('Cluster Label').type(configuration.label);
        containsClick('Select a Database Engine').type(
          `${configuration.engine} v${configuration.version} {enter}`
        );
        containsClick('Select a Region').type(
          `${configuration.regionTypeahead} {enter}`
        );

        // Database Linode type selection.
        if (configuration.linodeType.indexOf('-dedicated-') !== -1) {
          fbtClick('Dedicated CPU');
        } else {
          fbtClick('Shared CPU');
        }
        getClick(`[id="${configuration.linodeType}"]`);

        // Database cluster size selection.
        if (configuration.clusterSize > 1) {
          containsClick('3 Nodes');
        } else {
          containsClick('1 Node');
        }

        // Create database.
        fbtClick('Create Database Cluster');

        // Verify database is listed and appears to be configured correctly.
        cy.wait('@createDatabase');
        cy.wait('@listDatabases');
        cy.get(`[data-qa-database-cluster-id="${databaseMock.id}"]`).within(
          () => {
            cy.findByText(configuration.label).should('be.visible');
            cy.findByText('Provisioning').should('be.visible');
            cy.findByText(
              `${configuration.engine} v${configuration.version}`
            ).should('be.visible');
            cy.findByText(configuration.regionTypeahead, {
              exact: false,
            }).should('be.visible');
          }
        );

        // Begin intercepting and stubbing event to mock database creation completion.
        cy.intercept('GET', '*/account/events?page_size=25', (req) => {
          req.reply(paginateResponse(eventMock));
        }).as('getEvent');

        cy.wait('@getEvent');
        cy.wait('@listDatabases');
        cy.get(`[data-qa-database-cluster-id="${databaseMock.id}"]`).within(
          () => {
            cy.findByText('Active').should('be.visible');
          }
        );
      });
    }
  );
});
