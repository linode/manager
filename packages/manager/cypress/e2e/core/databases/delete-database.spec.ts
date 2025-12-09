/**
 * @file DBaaS integration tests for delete operations.
 */

import {
  databaseConfigurations,
  mockDatabaseNodeTypes,
} from 'support/constants/databases';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockDeleteDatabase,
  mockDeleteProvisioningDatabase,
  mockGetDatabase,
  mockGetDatabaseTypes,
} from 'support/intercepts/databases';
import { ui } from 'support/ui';
import { randomIp, randomNumber } from 'support/util/random';

import { accountFactory, databaseFactory } from 'src/factories';

import type { DatabaseClusterConfiguration } from 'support/constants/databases';

describe('Delete database clusters', () => {
  databaseConfigurations.forEach(
    (configuration: DatabaseClusterConfiguration) => {
      describe(`Deletes a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
        /*
         * - Tests database deletion UI flow using mocked data.
         * - Confirms that database deletion flow can be completed.
         * - Confirms that user is redirected to database landing page upon completion.
         */
        it('Can delete active database clusters', () => {
          const allowedIp = randomIp();
          const database = databaseFactory.build({
            allow_list: [allowedIp],
            engine: configuration.dbType,
            id: randomNumber(1, 1000),
            label: configuration.label,
            region: configuration.region.id,
            status: 'active',
            type: configuration.linodeType,
          });

          // Mock account to ensure 'Managed Databases' capability.
          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockDeleteDatabase(database.id, database.engine).as('deleteDatabase');

          cy.visitWithLogin(
            `/databases/${database.engine}/${database.id}/settings`
          );
          cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);

          // Click "Delete Cluster" button.
          ui.cdsButton
            .findButtonByTitle('Delete Cluster')
            .should('be.visible')
            .click();

          // Fill out type-to-confirm, click "Delete Cluster" button, confirm error.
          ui.dialog
            .findByTitle(`Delete Database Cluster ${database.label}`)
            .should('be.visible')
            .within(() => {
              cy.findByLabelText('Cluster Name').click();
              cy.focused().type(database.label);

              ui.buttonGroup
                .findButtonByTitle('Delete Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();

              cy.wait('@deleteDatabase');
            });

          cy.url().should('endWith', '/databases');
          ui.toast.assertMessage('Database Cluster deleted successfully.');
        });

        /*
         * - Tests provisioning database deletion UI flow using mocked data.
         * - Confirms that error is shown to user upon deletion attempt.
         */
        it('Cannot delete provisioning database clusters', () => {
          const database = databaseFactory.build({
            allow_list: [],
            engine: configuration.dbType,
            hosts: {
              primary: undefined,
              secondary: undefined,
            },
            id: randomNumber(1, 1000),
            label: configuration.label,
            region: configuration.region.id,
            status: 'provisioning',
            type: configuration.linodeType,
          });

          const errorMessage =
            'Your database is provisioning; please wait until provisioning is complete to perform this operation.';

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockDeleteProvisioningDatabase(
            database.id,
            database.engine,
            errorMessage
          ).as('deleteDatabase');

          cy.visitWithLogin(
            `/databases/${database.engine}/${database.id}/settings`
          );
          cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);

          // Click "Delete Cluster" button.
          ui.cdsButton
            .findButtonByTitle('Delete Cluster')
            .should('be.visible')
            .click();

          // Fill out type-to-confirm, click "Delete Cluster" button, confirm error.
          ui.dialog
            .findByTitle(`Delete Database Cluster ${database.label}`)
            .should('be.visible')
            .within(() => {
              cy.findByLabelText('Cluster Name').click();
              cy.focused().type(database.label);

              ui.buttonGroup
                .findButtonByTitle('Delete Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();

              cy.wait('@deleteDatabase');
              cy.findByText(errorMessage).should('be.visible');
            });
        });
      });
    }
  );
});
