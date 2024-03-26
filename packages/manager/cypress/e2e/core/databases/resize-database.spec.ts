/**
 * @file DBaaS integration tests for resize operations.
 */

import { randomNumber, randomIp, randomString } from 'support/util/random';
import { databaseFactory, possibleStatuses } from 'src/factories/databases';
import { ui } from 'support/ui';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetDatabase,
  mockGetDatabaseCredentials,
  mockGetDatabaseTypes,
  mockResize,
  mockResizeProvisioningDatabase,
  mockGetDatabasePrices,
} from 'support/intercepts/databases';
import {
  databaseClusterConfiguration,
  databaseConfigurationsResize,
  mockDatabaseNodeTypes,
} from 'support/constants/databases';
import { accountFactory } from '@src/factories';
import { contains } from 'ramda';

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
    .findByTitle(`Resize ${initialLabel}?`)
    .should('be.visible')
    .within(() => {
      ui.buttonGroup.findButtonByTitle('Resize').should('be.visible').click();
    });
};

describe('Resizing existing clusters', () => {
  databaseConfigurationsResize.forEach(
    (configuration: databaseClusterConfiguration) => {
      describe(`Resizes a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
        /*
         * - Tests active database resize UI flows using mocked data.
         * - Confirms that users can resize an existing database.
         * - Confirms that users can not downsize and smaller plans are disabled.
         */
        it('Can resize active database clusters', () => {
          const initialLabel = configuration.label;
          const allowedIp = randomIp();
          const initialPassword = randomString(16);
          const database = databaseFactory.build({
            id: randomNumber(1, 1000),
            //type: 'g6-standard-16',
            type: configuration.linodeType,
            label: initialLabel,
            region: configuration.region.id,
            engine: configuration.dbType,
            status: 'active',
            allow_list: [allowedIp],
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
          //cy.contains('button', 'Scale Up Database Cluster').should('be.enabled');
          ui.button
            .findByTitle('Resize Database Cluster')
            .should('be.visible')
            .should('be.disabled');

          // const disabledPlanNames = ["Linode 1 GB", 'Linode 2 GB', 'Linode 3 GB'];
          // // cy.findByLabelText(`List of Linode Plans`)
          // cy.get('[aria-label="List of Linode Plans"]')
          //   .should('be.visible')
          //   .each(() => {
          //     disabledPlanNames.forEach((planName) => {
          //   //  Find the table row for each disabled plan,
          //   //  confirm that they're each disabled.
          //       cy.contains(planName).should('be.visible').closest('tr').should('have.attr', 'aria-disabled');
          //   });
          // });
          let nodeTypeClass = '';
          if (configuration.linodeType.includes('standard')) {
            nodeTypeClass = 'standard';
          } else {
            nodeTypeClass = 'dedicated';
          }

          // Find the plan name of smaller size than current plan using `nodeType` and check if it's disabled,
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
                  cy.contains(nodeType.label)
                    .should('be.visible')
                    .closest('tr')
                    .should('have.attr', 'aria-disabled');
                });
            });
          // Find the current plan name using `nodeType` and check if it has current tag displaying in UI and radio button disabled,
          mockDatabaseNodeTypes
            .filter(
              (nodeType) =>
                nodeType.class === nodeTypeClass &&
                nodeType.memory == databaseType.memory
            )
            .forEach((nodeType) => {
              cy.get('[aria-label="List of Linode Plans"]')
                .should('be.visible')
                .each(() => {
                  //  cy.contains(nodeType.label).parent().should('contain', 'Current Plan');
                  cy.get(`[data-qa-current-plan]`)
                    .parent()
                    .should('contain', nodeType.label)
                    .should('contain', 'Current Plan');
                  //  cy.contains(nodeType.label).should('be.disabled');
                  // Find the plan name using `nodeType` and check if it's enabled/disabled,
                  // similar to before.
                });
            });
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
                  // cy.contains(nodeType.label).should('be.visible').closest('tr').should('have.attr', 'aria-checked');
                  cy.get(`[id="${nodeType.id}"]`).should('be.enabled').click();
                  // Find the plan name using `nodeType` and check if it's enabled/disabled,
                  // similar to before.
                });
              cy.get('[data-testid="summary"]').should(
                'contain',
                nodeType.label
              );
            });

          mockResize(database.id, database.engine, {
            ...database,
            type: 'g6-standard-32',
          }).as('scaleUpDatabase');
          resizeDatabase(initialLabel);
          cy.wait('@scaleUpDatabase');
        });

        /*
         * - Tests resizing database using mocked data.
         * - Confirms that users cannot resize database  for failed DBs.
         * - Confirms that users cannot resize database  for restoring DBs.
         * - Confirms that users cannot resize database  for degraded DBs.
         */
        it('Cannot resize database clusters while they are provisioning', () => {
          // const databaseStatus = ["provisioning", 'failed', 'restoring'];
          possibleStatuses.forEach((dbstatus) => {
            if (dbstatus != 'active') {
              const initialLabel = configuration.label;
              // const updateAttemptLabel = randomLabel();
              const allowedIp = randomIp();
              const database = databaseFactory.build({
                id: randomNumber(1, 1000),
                type: configuration.linodeType,
                label: initialLabel,
                region: configuration.region.id,
                engine: configuration.dbType,
                //engine: 'mysql',
                status: dbstatus,
                allow_list: [allowedIp],
                hosts: {
                  primary: undefined,
                  secondary: undefined,
                },
              });

              const errorMessage = `Your database is ${dbstatus}; please wait until it becomes active to perform this operation.`;
              // const hostnameRegex = /your hostnames? will appear here once (it is|they are) available./i;

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

              // Cannot update database label.
              // updateDatabaseLabel(initialLabel, updateAttemptLabel);
              // cy.wait('@updateDatabase');
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
              // if (!databaseType) {
              //   throw new Error(`Unknown database type ${database.type}`);
              // }
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
