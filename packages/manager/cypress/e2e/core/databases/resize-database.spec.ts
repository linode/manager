/**
 * @file DBaaS integration tests for resize operations.
 */
import { ClusterSize, RegionAvailability } from '@linode/api-v4';
import { accountFactory } from '@src/factories';
import {
  databaseConfigurationsResize,
  databaseRegionAvailability,
  mockDatabaseNodeTypes,
} from 'support/constants/databases';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetDatabase,
  mockGetDatabaseCredentials,
  mockGetDatabaseTypes,
  mockGetRegionAvailability,
  mockResize,
  mockResizeProvisioningDatabase,
} from 'support/intercepts/databases';
import { ui } from 'support/ui';
import { randomIp, randomNumber, randomString } from 'support/util/random';
import { getRegionById } from 'support/util/regions';

import { databaseFactory, possibleStatuses } from 'src/factories/databases';

import type { DatabaseClusterConfiguration } from 'support/constants/databases';

/**
 * Resizes a current database cluster to a larger plan size.
 *
 * This requires that the 'Resize' tab is currently active. No
 * assertion is made on the result of the access control update attempt.
 *
 * @param initialLabel - Database label to resize.
 */

const resizeDatabase = (initialLabel: string) => {
  ui.cdsButton
    .findButtonByTitle('Resize Database Cluster')
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

/**
 * Get Nodes label as per the clusterSize of the database
 *
 * @param clusterSize - Database Cluster Size
 */
const getNodes = (clusterSize: number) => {
  const nodes =
    clusterSize == 1
      ? 'Primary (1 Node)'
      : clusterSize == 2
        ? 'Primary (+1 Node)'
        : 'Primary (+2 Nodes)';
  return nodes;
};

describe('Resizing existing clusters', () => {
  databaseConfigurationsResize.forEach(
    (configuration: DatabaseClusterConfiguration) => {
      describe(`Resizes a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
        /*
         * - Tests active database resize UI flows using mocked data.
         * - Confirms that users can resize an existing database.
         * - Confirms that users can not downsize and smaller plans are disabled.
         * - Confirms that larger size plans are enabled to select for resizing and summary section displays pricing details for the selected plan.
         */

        it(`Validated initial state of resizing a database cluster`, () => {
          const initialLabel = configuration.label;
          const allowedIp = randomIp();
          const initialPassword = randomString(16);
          const database = databaseFactory.build({
            allow_list: [allowedIp],
            cluster_size: configuration.clusterSize,
            engine: configuration.dbType,
            id: randomNumber(1, 1000),
            label: initialLabel,
            platform: 'rdbms-default',
            region: configuration.region.id,
            status: 'active',
            type: configuration.linodeType,
            used_disk_size_gb: 100,
          });

          // Mock account to ensure 'Managed Databases' capability.
          const databaseType = mockDatabaseNodeTypes.find(
            (nodeType) => nodeType.id === database.type
          );
          const regionAvailability: RegionAvailability[] =
            databaseRegionAvailability;
          if (!databaseType) {
            throw new Error(`Unknown database type ${database.type}`);
          }
          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockGetRegionAvailability(database.region, regionAvailability);
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
          ui.cdsButton
            .findButtonByTitle('Resize Database Cluster')
            .should('be.visible')
            .should('be.disabled');

          let nodeTypeClass = '';
          let tabs = ['Dedicated CPU', 'Shared CPU'];
          if (configuration.linodeType.includes('premium')) {
            tabs = ['Premium CPU'];
          }

          tabs.forEach((tabTitle) => {
            // Click on the tab we want.
            ui.button.findByTitle(tabTitle).should('be.visible').click();

            if (tabTitle == 'Dedicated CPU') {
              nodeTypeClass = 'dedicated';
            } else if (tabTitle == 'Premium CPU') {
              nodeTypeClass = 'premium';
            } else {
              nodeTypeClass = 'standard';
            }

            if (configuration.linodeType.includes('premium')) {
              ui.button
                .findByTitle('Dedicated CPU')
                .should('be.visible')
                .should('be.disabled');
              ui.button
                .findByTitle('Shared CPU')
                .should('be.visible')
                .should('be.disabled');
            } else {
              ui.button
                .findByTitle('Premium CPU')
                .should('be.visible')
                .should('be.disabled');
            }
            // Find the smaller plans name using `nodeType` and check radio button is disabled to select only if size is smaller than used_disk_space
            mockDatabaseNodeTypes
              .filter(
                (nodeType) =>
                  nodeType.class === nodeTypeClass &&
                  nodeType.memory < databaseType.memory &&
                  nodeType.disk / 1024 <= (database.used_disk_size_gb ?? 0)
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
                // nodeType.class != mockGetDatabaseRegionsAvailability(configuration.region)
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

            // Check radio button is enabled to select different number of nodes
            const size = [1, 2, 3];
            cy.get('[data-testid="database-nodes"]').within(() => {
              size.forEach((clusterSize) => {
                if (clusterSize == 2) {
                  if (
                    tabTitle == 'Premium CPU' ||
                    tabTitle == 'Dedicated CPU'
                  ) {
                    cy.get(`[data-testid="database-node-${clusterSize}"]`)
                      .should('be.enabled')
                      .click();
                  } else {
                    cy.get(
                      `[data-testid="database-node-${clusterSize}"]`
                    ).should('not.exist');
                  }
                } else {
                  cy.get(`[data-testid="database-node-${clusterSize}"]`)
                    .should('be.enabled')
                    .click();
                }
              });
            });
          });

          // Find the current plan name using `nodeType` and check if it has current tag displaying in UI and radio button disabled,
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
        });

        /*
         * - Tests active/provisioning/resizing databases resize UI flows using mocked data.
         */
        possibleStatuses.forEach((dbstatus) => {
          if (
            dbstatus == 'active' ||
            dbstatus == 'provisioning' ||
            dbstatus == 'resizing'
          ) {
            /*
             * - Confirms that users can resize an existing database.
             * - Confirms that users can scale up/down to available plans as per used_disk_space.
             * - Confirms the summary page is updated with the new resized plan of database cluster.
             */
            it(`Can resize ${dbstatus} database clusters vertically to lower/higher available plans`, () => {
              const initialLabel = configuration.label;
              const allowedIp = randomIp();
              const initialPassword = randomString(16);
              const database = databaseFactory.build({
                allow_list: [allowedIp],
                cluster_size: 3,
                engine: configuration.dbType,
                id: randomNumber(1, 1000),
                label: initialLabel,
                platform: 'rdbms-default',
                region: configuration.region.id,
                status: dbstatus,
                type: configuration.linodeType,
                used_disk_size_gb: 100,
              });

              const regionAvailability: RegionAvailability[] =
                databaseRegionAvailability;
              const databaseRegionLabel = getRegionById(database.region).label;
              const nodes = getNodes(configuration.clusterSize);
              // Mock account to ensure 'Managed Databases' capability.
              const databaseType = mockDatabaseNodeTypes.find(
                (nodeType) => nodeType.id === database.type
              );
              if (!databaseType) {
                throw new Error(`Unknown database type ${database.type}`);
              }
              mockGetAccount(accountFactory.build()).as('getAccount');
              mockGetDatabase(database).as('getDatabase');
              mockGetDatabaseTypes(mockDatabaseNodeTypes).as(
                'getDatabaseTypes'
              );
              mockGetRegionAvailability(database.region, regionAvailability);
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
              ui.cdsButton
                .findButtonByTitle('Resize Database Cluster')
                .should('be.visible')
                .should('be.disabled');

              let nodeTypeClass = '';

              if (configuration.linodeType.includes('dedicated')) {
                nodeTypeClass = 'dedicated';
                ui.button
                  .findByTitle('Dedicated CPU')
                  .should('be.visible')
                  .click();
              } else if (configuration.linodeType.includes('premium')) {
                nodeTypeClass = 'premium';
                ui.button
                  .findByTitle('Premium CPU')
                  .should('be.visible')
                  .click();
              } else {
                nodeTypeClass = 'standard';
                ui.button
                  .findByTitle('Shared CPU')
                  .should('be.visible')
                  .click();
              }
              // Find all the available plans name using `nodeType` and check radio button is enabled to select only if disk is greater than used_disk_space
              const availPlans = mockDatabaseNodeTypes.filter(
                (nodeType) =>
                  nodeType.class === nodeTypeClass &&
                  (nodeType.memory < databaseType.memory ||
                    nodeType.memory > databaseType.memory) &&
                  nodeType.disk / 1024 > (database.used_disk_size_gb ?? 0)
              );

              if (!databaseType) {
                throw new Error(`Unknown database type ${database.type}`);
              }

              // Select a random plan from the available list to resize
              if (availPlans.length > 0) {
                const newPlan =
                  availPlans[Math.floor(Math.random() * availPlans.length)];
                cy.get(`[id="${newPlan.id}"]`).click();

                const databaseMock = databaseFactory.build({
                  ...database,
                  type: newPlan.id,
                });

                mockResize(database.id, database.engine, databaseMock).as(
                  'scaleUpDatabase'
                );
                resizeDatabase(initialLabel);
                cy.wait('@scaleUpDatabase');

                // Validate resizing redirects to Summary page
                cy.url().should(
                  'endWith',
                  `/databases/${databaseMock.engine}/${databaseMock.id}/summary`
                );

                // Validate New Cluster Configuration on Summary page
                [
                  'Status',
                  'Plan',
                  'Nodes',
                  'CPUs',
                  'Engine',
                  'Region',
                  'RAM',
                  'Total Disk Size',
                  databaseMock.label,
                  databaseRegionLabel,
                  `${configuration.engine} v${databaseMock.version}`,
                  nodes,
                  `${databaseMock.total_disk_size_gb} GB`,
                ].forEach((text: string) => {
                  cy.findByText(text).should('be.visible');
                });
              }
            });

            /*
             * - Confirms that users can resize an existing database.
             * - Confirms that users can scale horizontally to available nodes.
             * - Confirms the summary page is updated with the new resized nodes of database cluster.
             */
            it(`Can resize ${dbstatus} database clusters horizontally`, () => {
              const initialLabel = configuration.label;
              const allowedIp = randomIp();
              const initialPassword = randomString(16);
              const database = databaseFactory.build({
                allow_list: [allowedIp],
                cluster_size: 3,
                engine: configuration.dbType,
                id: randomNumber(1, 1000),
                label: initialLabel,
                platform: 'rdbms-default',
                region: configuration.region.id,
                status: dbstatus,
                type: configuration.linodeType,
                used_disk_size_gb: 100,
              });

              const regionAvailability: RegionAvailability[] =
                databaseRegionAvailability;
              const databaseRegionLabel = getRegionById(database.region).label;
              // Mock account to ensure 'Managed Databases' capability.
              const databaseType = mockDatabaseNodeTypes.find(
                (nodeType) => nodeType.id === database.type
              );
              if (!databaseType) {
                throw new Error(`Unknown database type ${database.type}`);
              }
              mockGetAccount(accountFactory.build()).as('getAccount');
              mockGetDatabase(database).as('getDatabase');
              mockGetDatabaseTypes(mockDatabaseNodeTypes).as(
                'getDatabaseTypes'
              );
              mockGetRegionAvailability(database.region, regionAvailability);
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
              ui.cdsButton
                .findButtonByTitle('Resize Database Cluster')
                .should('be.visible')
                .should('be.disabled');

              let tabs: string = 'Shared CPU';
              if (configuration.linodeType.includes('premium')) {
                tabs = 'Premium CPU';
              } else if (configuration.linodeType.includes('dedicated')) {
                tabs = 'Dedicated CPU';
              }

              // Click on the tab we want.
              ui.button.findByTitle(tabs).should('be.visible').click();

              let newNode: ClusterSize = configuration.clusterSize;

              // Find an available node for resize
              if (
                configuration.linodeType.includes('dedicated') ||
                configuration.linodeType.includes('premium')
              ) {
                const newNodeList = [1, 2, 3].filter(
                  (size) => size !== configuration.clusterSize
                );
                newNode = newNodeList[
                  Math.floor(Math.random() * newNodeList.length)
                ] as ClusterSize;
              } else {
                newNode = [1, 3].find(
                  (size) => size !== configuration.clusterSize
                ) as ClusterSize;
              }

              if (newNode === configuration.clusterSize) {
                ui.cdsButton
                  .findButtonByTitle('Resize Database Cluster')
                  .should('be.visible')
                  .should('be.disabled');
              } else {
                // Select a node for resize and resize the current database cluster
                cy.get('[data-testid="database-nodes"]').within(() => {
                  cy.get(`[data-testid="database-node-${newNode}"]`).click();
                });
                const databaseMock = databaseFactory.build({
                  ...database,
                  cluster_size: newNode,
                });
                mockResize(database.id, database.engine, databaseMock).as(
                  'scaleUpDatabase'
                );
                resizeDatabase(initialLabel);
                cy.wait('@scaleUpDatabase');

                // Validate resizing redirects to Summary page
                cy.url().should(
                  'endWith',
                  `/databases/${databaseMock.engine}/${databaseMock.id}/summary`
                );

                // Validate Cluster Configuration on Summary page
                [
                  'Status',
                  'Plan',
                  'Nodes',
                  'CPUs',
                  'Engine',
                  'Region',
                  'RAM',
                  'Total Disk Size',
                  databaseMock.label,
                  databaseRegionLabel,
                  `${configuration.engine} v${databaseMock.version}`,
                  getNodes(newNode),
                  `${databaseMock.total_disk_size_gb} GB`,
                ].forEach((text: string) => {
                  cy.findByText(text).should('be.visible');
                });
              }
            });
          }
        });

        /*
         * - Tests active database resize UI flows using mocked data.
         * - Confirms that users can resize an existing database from dedicated to shared.
         * - Confirms that users can resize an existing database from shared to dedicated.
         */
        it(`Can only resize dedicated/shared database clusters type and switch plan type`, () => {
          const initialLabel = configuration.label;
          const allowedIp = randomIp();
          const initialPassword = randomString(16);
          const database = databaseFactory.build({
            allow_list: [allowedIp],
            cluster_size: 3,
            engine: configuration.dbType,
            id: randomNumber(1, 1000),
            platform: 'rdbms-default',
            label: initialLabel,
            region: configuration.region.id,
            status: 'active',
            type: configuration.linodeType,
            used_disk_size_gb: 100,
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

          ui.cdsButton
            .findButtonByTitle('Resize Database Cluster')
            .should('be.visible')
            .should('be.disabled');

          let nodeTypeClass = '';

          // Cannot cross resize from and to premium plans
          if (configuration.linodeType.includes('premium')) {
            ui.button
              .findByTitle('Shared CPU')
              .should('be.visible')
              .should('be.disabled');
            ui.button
              .findByTitle('Dedicated CPU')
              .should('be.visible')
              .should('be.disabled');
            return;
          }

          // Find the current plan name using `nodeType` and switch to another tab for selecting plan.
          if (configuration.linodeType.includes('dedicated')) {
            nodeTypeClass = 'dedicated';
            ui.button.findByTitle('Shared CPU').should('be.visible').click();
            ui.button
              .findByTitle('Premium CPU')
              .should('be.visible')
              .should('be.disabled');
          } else {
            nodeTypeClass = 'standard';
            ui.button.findByTitle('Dedicated CPU').should('be.visible').click();
            ui.button
              .findByTitle('Premium CPU')
              .should('be.visible')
              .should('be.disabled');
          }

          const availPlans = mockDatabaseNodeTypes.filter(
            (nodeType) =>
              nodeType.class != nodeTypeClass &&
              nodeType.class != 'premium' &&
              (nodeType.memory < databaseType.memory ||
                nodeType.memory > databaseType.memory) &&
              nodeType.disk / 1024 > (database.used_disk_size_gb ?? 0)
          );
          if (!databaseType) {
            throw new Error(`Unknown database type ${database.type}`);
          }
          // Select a random plan from the available list to resize
          if (availPlans.length > 0) {
            const newPlan =
              availPlans[Math.floor(Math.random() * availPlans.length)];
            cy.get(`[id="${newPlan.id}"]`).click();

            const databaseMock = databaseFactory.build({
              ...database,
              type: newPlan.id,
            });
            mockResize(database.id, database.engine, databaseMock).as(
              'scaleUpDatabase'
            );
            resizeDatabase(initialLabel);
            cy.wait('@scaleUpDatabase');
          }
        });

        /*
         * - Tests resizing database using mocked data.
         * - Confirms that users cannot resize database  for suspending DBs.
         * - Confirms that users cannot resize database  for suspended DBs.
         * - Confirms that users cannot resize database  for resuming DBs.
         */
        possibleStatuses.forEach((dbstatus) => {
          if (
            dbstatus == 'suspending' ||
            dbstatus == 'suspended' ||
            dbstatus == 'resuming'
          ) {
            it(`Cannot resize database clusters while they are in ${dbstatus} state`, () => {
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
                platform: 'rdbms-default',
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
              let nodeTypeClass = 'standard';
              if (configuration.linodeType.includes('premium')) {
                nodeTypeClass = 'premium';
              } else if (configuration.linodeType.includes('dedicated')) {
                nodeTypeClass = 'dedicated';
              }
              const availPlans = mockDatabaseNodeTypes.filter(
                (nodeType) =>
                  nodeType.class === nodeTypeClass &&
                  (nodeType.memory < databaseType.memory ||
                    nodeType.memory > databaseType.memory) &&
                  nodeType.disk / 1024 > (database.used_disk_size_gb ?? 0)
              );
              if (!databaseType) {
                throw new Error(`Unknown database type ${database.type}`);
              }
              // Select a random plan from the available list to resize
              if (availPlans.length > 0) {
                const newPlan =
                  availPlans[Math.floor(Math.random() * availPlans.length)];
                cy.get(`[id="${newPlan.id}"]`).click();
                resizeDatabase(initialLabel);
                cy.wait('@resizeDatabase');
                cy.findByText(errorMessage).should('be.visible');
                cy.get('[data-qa-cancel="true"]')
                  .should('be.visible')
                  .should('be.enabled')
                  .click();
              }
            });
          }
        });
      });
    }
  );
});
