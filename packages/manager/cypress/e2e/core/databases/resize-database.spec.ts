/**
 * @file DBaaS integration tests for resize operations.
 */

import { accountFactory } from '@src/factories';
import {
  databaseConfigurationsResize,
  mockDatabaseNodeTypes,
} from 'support/constants/databases';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetDatabase,
  mockGetDatabaseCredentials,
  mockGetDatabaseTypes,
  mockResize,
  mockResizeProvisioningDatabase,
} from 'support/intercepts/databases';
import { ui } from 'support/ui';
import { randomIp, randomNumber, randomString } from 'support/util/random';

import { databaseFactory, possibleStatuses } from 'src/factories/databases';

import type { databaseClusterConfiguration } from 'support/constants/databases';

/**
 * Resizes a current database cluster to a larger plan size.
 *
 * This requires that the 'Resize' tab is currently active. No
 * assertion is made on the result of the access control update attempt.
 *
 * @param initialLabel - Database label to resize.
 */

const resizeDatabase = (initialLabel: string) => {
  ui.button
    .findByTitle('Resize Database Cluster')
    .should('be.visible')
    .should('be.enabled')
    .click();
  ui.dialog
    .findByTitle(`Resize Database Cluster ${initialLabel}?`)
    .should('be.visible')
    .within(() => {
      cy.findByLabelText('Cluster Name').click();
      cy.focused().type(initialLabel);
      ui.buttonGroup
        .findButtonByTitle('Resize Cluster')
        .should('be.visible')
        .click();
    });
};

describe('Resizing existing clusters', () => {
  databaseConfigurationsResize.forEach(
    (configuration: databaseClusterConfiguration) => {
      describe(`Resizes a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster (legacy DBaaS)`, () => {
        /*
         * - Tests active database resize UI flows using mocked data.
         * - Confirms that users can resize an existing database.
         * - Confirms that users can not downsize and smaller plans are disabled.
         * - Confirms that larger size plans are enabled to select for resizing and summary section displays pricing details for the selected plan.
         */
        it('Can resize active database clusters', () => {
          const initialLabel = configuration.label;
          const allowedIp = randomIp();
          const initialPassword = randomString(16);
          const database = databaseFactory.build({
            allow_list: [allowedIp],
            cluster_size: 3,
            engine: configuration.dbType,
            id: randomNumber(1, 1000),
            label: initialLabel,
            platform: 'rdbms-legacy',
            region: configuration.region.id,
            status: 'active',
            type: configuration.linodeType,
          });

          // Mock account to ensure 'Managed Databases' capability.
          const databaseType = mockDatabaseNodeTypes.find(
            (nodeType) => nodeType.id === database.type
          );
          if (!databaseType) {
            throw new Error(`Unknown database type ${database.type}`);
          }
          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockGetDatabaseCredentials(
            database.id,
            database.engine,
            initialPassword
          ).as('getCredentials');

          cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
          cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);

          cy.get('[data-reach-tab-list]').within(() => {
            cy.findByText('Resize').should('be.visible').click();
          });
          ui.button
            .findByTitle('Resize Database Cluster')
            .should('be.visible')
            .should('be.disabled');

          let nodeTypeClass = '';

          ['Dedicated CPU', 'Shared CPU'].forEach((tabTitle) => {
            // Click on the tab we want.
            ui.button.findByTitle(tabTitle).should('be.visible').click();

            if (tabTitle == 'Dedicated CPU') {
              nodeTypeClass = 'dedicated';
            } else {
              nodeTypeClass = 'standard';
            }
            // Find the smaller plans name using `nodeType` and check radio button is disabled to select
            mockDatabaseNodeTypes
              .filter(
                (nodeType) =>
                  nodeType.class === nodeTypeClass &&
                  nodeType.memory < databaseType.memory
              )
              .forEach((nodeType) => {
                cy.get('[aria-label="List of Linode Plans"]')
                  .should('be.visible')
                  .each(() => {
                    cy.contains(nodeType.label).should('be.visible');
                    cy.get(`[id="${nodeType.id}"]`).should('be.disabled');
                  });
              });

            // Find the larger plans name using `nodeType` and check radio button is enabled to select
            mockDatabaseNodeTypes
              .filter(
                (nodeType) =>
                  nodeType.class === nodeTypeClass &&
                  nodeType.memory > databaseType.memory
              )
              .forEach((nodeType) => {
                cy.get('[aria-label="List of Linode Plans"]')
                  .should('be.visible')
                  .each(() => {
                    cy.get(`[id="${nodeType.id}"]`)
                      .should('be.enabled')
                      .click();
                  });
                const desiredPlanPrice = nodeType.engines[
                  configuration.dbType
                ].find((dbClusterSizeObj: { quantity: number }) => {
                  return dbClusterSizeObj.quantity === database.cluster_size;
                })?.price;
                if (!desiredPlanPrice) {
                  throw new Error('Unable to find mock plan type');
                }
                cy.get('[data-testid="resizeSummary"]').within(() => {
                  cy.contains(`${nodeType.label}`).should('be.visible');
                  cy.contains(`$${desiredPlanPrice.monthly}/month`).should(
                    'be.visible'
                  );
                });
              });
          });
          // Find the current plan name using `nodeType` and check if it has current tag displaying in UI and radio button disabled,
          if (configuration.linodeType.includes('dedicated')) {
            nodeTypeClass = 'dedicated';
            ui.button.findByTitle('Dedicated CPU').should('be.visible').click();
          } else {
            nodeTypeClass = 'standard';
            ui.button.findByTitle('Shared CPU').should('be.visible').click();
          }
          mockDatabaseNodeTypes
            .filter(
              (nodeType) =>
                // nodeType.class === nodeTypeClass &&
                nodeType.id === database.type
            )
            .forEach((nodeType) => {
              cy.get('[aria-label="List of Linode Plans"]')
                .should('be.visible')
                .each(() => {
                  cy.get(`[data-qa-current-plan]`)
                    .parent()
                    .should('contain', nodeType.label)
                    .should('contain', 'Current Plan');
                });
            });

          const largePlan = mockDatabaseNodeTypes.filter(
            (nodeType) =>
              nodeType.class === nodeTypeClass &&
              nodeType.memory > databaseType.memory
          );
          if (!databaseType) {
            throw new Error(`Unknown database type ${database.type}`);
          }
          cy.get(`[id="${largePlan[0].id}"]`).click();

          mockResize(database.id, database.engine, {
            ...database,
            type: 'g6-standard-32',
          }).as('scaleUpDatabase');
          resizeDatabase(initialLabel);
          cy.wait('@scaleUpDatabase');
        });

        /*
         * - Tests active database resize UI flows using mocked data.
         * - Confirms that users can resize an existing database from dedicated to shared.
         * - Confirms that users can resize an existing database from shared to dedicated.
         */
        it(`Can resize active database clusters from ${configuration.linodeType} type and switch plan type`, () => {
          const initialLabel = configuration.label;
          const allowedIp = randomIp();
          const initialPassword = randomString(16);
          const database = databaseFactory.build({
            allow_list: [allowedIp],
            cluster_size: 3,
            engine: configuration.dbType,
            id: randomNumber(1, 1000),
            label: initialLabel,
            region: configuration.region.id,
            status: 'active',
            type: configuration.linodeType,
          });

          // Mock account to ensure 'Managed Databases' capability.
          const databaseType = mockDatabaseNodeTypes.find(
            (nodeType) => nodeType.id === database.type
          );
          if (!databaseType) {
            throw new Error(`Unknown database type ${database.type}`);
          }
          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockGetDatabaseCredentials(
            database.id,
            database.engine,
            initialPassword
          ).as('getCredentials');

          cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
          cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);

          cy.get('[data-reach-tab-list]').within(() => {
            cy.findByText('Resize').should('be.visible').click();
          });
          ui.button
            .findByTitle('Resize Database Cluster')
            .should('be.visible')
            .should('be.disabled');

          let nodeTypeClass = '';
          // Find the current plan name using `nodeType` and switch to another tab for selecting plan.
          if (configuration.linodeType.includes('dedicated')) {
            nodeTypeClass = 'dedicated';
            ui.button.findByTitle('Shared CPU').should('be.visible').click();
          } else {
            nodeTypeClass = 'standard';
            ui.button.findByTitle('Dedicated CPU').should('be.visible').click();
          }

          const largePlan = mockDatabaseNodeTypes.filter(
            (nodeType) =>
              nodeType.class != nodeTypeClass &&
              nodeType.memory > databaseType.memory
          );
          if (!databaseType) {
            throw new Error(`Unknown database type ${database.type}`);
          }
          cy.get(`[id="${largePlan[0].id}"]`).click();

          mockResize(database.id, database.engine, {
            ...database,
            type: 'g6-standard-32',
          }).as('scaleUpDatabase');
          resizeDatabase(initialLabel);
          cy.wait('@scaleUpDatabase');
        });

        /*
         * - Tests resizing database using mocked data.
         * - Confirms that users cannot resize database  for provisioning DBs.
         * - Confirms that users cannot resize database  for restoring DBs.
         * - Confirms that users cannot resize database  for failed DBs.
         * - Confirms that users cannot resize database  for degraded DBs
         */
        it('Cannot resize database clusters while they are not in active state', () => {
          // const databaseStatus = ["provisioning", 'failed', 'restoring'];
          possibleStatuses.forEach((dbstatus) => {
            if (dbstatus != 'active') {
              const initialLabel = configuration.label;
              const allowedIp = randomIp();
              const database = databaseFactory.build({
                allow_list: [allowedIp],
                cluster_size: 3,
                engine: configuration.dbType,
                hosts: {
                  primary: undefined,
                  secondary: undefined,
                },
                id: randomNumber(1, 1000),
                label: initialLabel,
                region: configuration.region.id,
                status: dbstatus,
                type: configuration.linodeType,
              });

              const errorMessage = `Your database is ${dbstatus}; please wait until it becomes active to perform this operation.`;

              mockGetAccount(accountFactory.build()).as('getAccount');
              mockGetDatabase(database).as('getDatabase');
              mockGetDatabaseTypes(mockDatabaseNodeTypes).as(
                'getDatabaseTypes'
              );

              cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
              cy.wait(['@getAccount', '@getDatabaseTypes', '@getDatabase']);

              mockResize(database.id, database.engine, {
                ...database,
                type: 'g6-standard-32',
              }).as('resizeDatabase');

              mockResizeProvisioningDatabase(
                database.id,
                database.engine,
                errorMessage
              ).as('resizeDatabase');

              cy.get('[data-reach-tab-list]').within(() => {
                cy.findByText('Resize').should('be.visible').click();
              });
              const databaseType = mockDatabaseNodeTypes.find(
                (nodeType) => nodeType.id === database.type
              );
              if (!databaseType) {
                throw new Error(`Unknown database type ${database.type}`);
              }
              let nodeTypeClass = '';
              if (configuration.linodeType.includes('standard')) {
                nodeTypeClass = 'standard';
              } else {
                nodeTypeClass = 'dedicated';
              }
              const largePlan = mockDatabaseNodeTypes.filter(
                (nodeType) =>
                  nodeType.class === nodeTypeClass &&
                  nodeType.memory > databaseType.memory
              );
              if (!databaseType) {
                throw new Error(`Unknown database type ${database.type}`);
              }
              cy.get(`[id="${largePlan[0].id}"]`).click();
              resizeDatabase(initialLabel);
              cy.wait('@resizeDatabase');
              cy.findByText(errorMessage).should('be.visible');
              cy.get('[data-qa-cancel="true"]')
                .should('be.visible')
                .should('be.enabled')
                .click();
            }
          });
        });
      });
    }
  );
});
