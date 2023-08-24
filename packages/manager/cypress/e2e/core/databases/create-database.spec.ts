import { databaseFactory } from 'src/factories/databases';
import { eventFactory } from 'src/factories/events';
import {
  databaseClusterConfiguration,
  databaseConfigurations,
} from 'support/constants/databases';
import {
  mockCreateDatabase,
  mockGetDatabases,
} from 'support/intercepts/databases';
import { mockGetEvents } from 'support/intercepts/events';
import { getRegionById } from 'support/util/regions';
import { ui } from 'support/ui';

describe('create a database cluster, mocked data', () => {
  databaseConfigurations.forEach(
    (configuration: databaseClusterConfiguration) => {
      // @TODO Add assertions for DBaaS pricing.
      it(`creates a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
        // Database mock immediately after instance has been created.
        const databaseMock = databaseFactory.build({
          label: configuration.label,
          type: configuration.linodeType,
          region: configuration.region.id,
          version: configuration.version,
          status: 'provisioning',
          cluster_size: configuration.clusterSize,
          engine: configuration.dbType,
          hosts: {
            primary: null,
            secondary: null,
          },
        });

        // Database mock once instance has been provisioned.
        const databaseMockActive = {
          ...databaseMock,
          status: 'active',
        };

        const databaseRegionLabel = getRegionById(databaseMock.region).label;

        // Event mock which will trigger Cloud to re-fetch DBaaS instance.
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

        const clusterSizeSelection =
          configuration.clusterSize > 1 ? '3 Nodes' : '1 Node';

        const clusterCpuType =
          configuration.linodeType.indexOf('-dedicated-') !== -1
            ? 'Dedicated CPU'
            : 'Shared CPU';

        mockCreateDatabase(databaseMock).as('createDatabase');
        mockGetDatabases([databaseMock]).as('getDatabases');

        cy.visitWithLogin('/databases/create');
        ui.entityHeader
          .find()
          .should('be.visible')
          .within(() => {
            cy.findByText('Create').should('be.visible');
          });

        cy.findByText('Cluster Label')
          .should('be.visible')
          .click()
          .type(configuration.label);

        cy.findByText('Database Engine')
          .should('be.visible')
          .click()
          .type(`${configuration.engine} v${configuration.version}{enter}`);

        cy.findByText('Region')
          .should('be.visible')
          .click()
          .type(`${configuration.region.label}{enter}`);

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
