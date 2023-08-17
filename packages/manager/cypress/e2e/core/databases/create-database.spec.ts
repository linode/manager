import { databaseFactory } from 'src/factories/databases';
import { eventFactory } from 'src/factories/events';
import { sequentialStub } from 'support/stubs/sequential-stub';
import { paginateResponse } from 'support/util/paginate';
import { apiMatcher } from 'support/util/intercepts';
import {
  databaseClusterConfiguration,
  databaseConfigurations,
} from 'support/constants/databases';
import { ui } from 'support/ui';
import { makeResponse } from 'support/util/response';

describe('create a database cluster, mocked data', () => {
  databaseConfigurations.forEach(
    (configuration: databaseClusterConfiguration) => {
      // @TODO Add assertions for DBaaS pricing.
      it(`creates a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
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
          apiMatcher(`databases/${configuration.dbType}/instances`),
          makeResponse(databaseMock)
        ).as('createDatabase');

        cy.intercept(
          'GET',
          apiMatcher('databases/instances?page=1&page_size=25'),
          sequentialStub([
            paginateResponse(databaseMock),
            paginateResponse({ ...databaseMock, status: 'active' }),
          ])
        ).as('listDatabases');

        cy.intercept(
          'GET',
          apiMatcher(`databases/${databaseMock.engine}/${databaseMock.id}`),
          makeResponse(databaseMock)
        ).as('getDatabase');

        cy.visitWithLogin('/databases/create');
        cy.get('[data-qa-header="Create"]').should('have.text', 'Create');

        cy.contains('Cluster Label').click().type(configuration.label);
        cy.contains('Select a Database Engine')
          .click()
          .type(`${configuration.engine} v${configuration.version} {enter}`);
        cy.contains('Select a Region')
          .click()
          .type(`${configuration.region.label} {enter}`);

        // Database Linode type selection.
        if (configuration.linodeType.indexOf('-dedicated-') !== -1) {
          cy.findByText('Dedicated CPU').should('be.visible').click();
        } else {
          cy.findByText('Shared CPU').should('be.visible').click();
        }
        cy.get(`[id="${configuration.linodeType}"]`).click();

        // Database cluster size selection.
        if (configuration.clusterSize > 1) {
          cy.contains('3 Nodes').click();
        } else {
          cy.contains('1 Node').click();
        }

        // Create database.
        cy.findByText('Create Database Cluster').should('be.visible').click();

        cy.wait('@createDatabase');
        cy.url().should(
          'endWith',
          `databases/${databaseMock.engine}/${databaseMock.id}`
        );

        // TODO Add details page assertions before navigating back to landing page.
        ui.entityHeader.find().within(() => {
          cy.findByText('Database Clusters').should('be.visible').click();
        });

        cy.url().should('endWith', '/databases');

        cy.wait('@listDatabases');
        cy.get(`[data-qa-database-cluster-id="${databaseMock.id}"]`).within(
          () => {
            cy.findByText(configuration.label).should('be.visible');
            cy.findByText('Provisioning').should('be.visible');
            // Confirm that database is the expected engine and major version.
            cy.findByText(`${configuration.engine} v${configuration.version}`, {
              exact: false,
            }).should('be.visible');
            cy.findByText(configuration.region.label, {
              exact: false,
            }).should('be.visible');
          }
        );

        // Begin intercepting and stubbing event to mock database creation completion.
        cy.intercept('GET', apiMatcher('account/events*'), (req) => {
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
