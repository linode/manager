/**
 * @file DBaaS integration tests for update operations.
 */

import { accountFactory } from '@src/factories';
import {
  databaseConfigurations,
  mockDatabaseNodeTypes,
} from 'support/constants/databases';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetDatabase,
  mockGetDatabaseCredentials,
  mockGetDatabaseTypes,
  mockResetPassword,
  mockResetPasswordProvisioningDatabase,
  mockUpdateDatabase,
  mockUpdateProvisioningDatabase,
} from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';

import { databaseFactory } from 'src/factories/databases';

import type { databaseClusterConfiguration } from 'support/constants/databases';

/**
 * Updates a database cluster's label.
 *
 * No assertion is made on the result of the update attempt.
 *
 * @param originalLabel - Original database cluster label.
 * @param newLabel - Desired new label for database cluster.
 */
const updateDatabaseLabel = (originalLabel: string, newLabel: string) => {
  cy.get('[data-qa-header]')
    .should('be.visible')
    .should('have.text', originalLabel);

  cy.findByLabelText(`Edit ${originalLabel}`).click();

  cy.get('[data-qa-edit-field="true"]')
    .should('be.visible')
    .within(() => {
      cy.get('[data-testid="textfield-input"]').should('be.visible').click();
      cy.focused().clear();
      cy.focused().type(newLabel);

      cy.get('[data-qa-save-edit="true"]').should('be.visible').click();
    });
};

/**
 * Removes an allowed IP.
 *
 * This requires that the 'Summary' or 'Settings' tab is currently active. No
 * assertion is made on the result of the IP removal attempt.
 *
 * @param allowedIp - Allowed IP to remove.
 */
const removeAllowedIp = (allowedIp: string) => {
  cy.get('[data-qa-access-controls]').within(() => {
    cy.findByText(allowedIp)
      .should('be.visible')
      .within(() => {
        cy.findByText('Remove').should('be.visible').closest('button').click();
      });
  });

  ui.dialog
    .findByTitle(`Remove IP Address ${allowedIp}`)
    .should('be.visible')
    .within(() => {
      ui.buttonGroup
        .findButtonByTitle('Remove IP Address')
        .should('be.visible')
        .click();
    });
};

/**
 * Adds allowed IPs for a cluster via the "Manage Access Controls" drawer.
 *
 * This requires that the 'Summary' or 'Settings' tab is currently active. No
 * assertion is made on the result of the access control update attempt.
 *
 * @param allowedIps - New IPs to add.
 * @param existingIps - The number of existing IPs. Optional, default is `0`.
 */
const manageAccessControl = (allowedIps: string[], existingIps: number = 0) => {
  cy.findByTestId('button-access-control').click();

  ui.drawer
    .findByTitle('Manage Access')
    .should('be.visible')
    .within(() => {
      allowedIps.forEach((allowedIp, index) => {
        if (existingIps > 0) {
          ui.button.findByTitle('Add Another IP').click();
        } else {
          ui.button.findByTitle('Add an IP').click();
        }
        cy.findByLabelText(
          `Allowed IP Addresses or Ranges ip-address-${index + existingIps}`
        ).click();
        cy.focused().type(allowedIp);
      });

      ui.buttonGroup
        .findButtonByTitle('Update Access Controls')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
};

/**
 * Resets root password.
 *
 * This requires that the 'Settings' tab is currently active. No assertion is
 * made on the result of the root password reset attempt.
 */
const resetRootPassword = () => {
  ui.button
    .findByAttribute('data-qa-settings-button', 'Reset Root Password')
    .should('be.visible')
    .click();

  ui.dialog
    .findByTitle('Reset Root Password')
    .should('be.visible')
    .within(() => {
      ui.buttonGroup
        .findButtonByTitle('Reset Root Password')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
};

describe('Update database clusters', () => {
  beforeEach(() => {
    const mockAccount = accountFactory.build({
      capabilities: [
        'Akamai Cloud Pulse',
        'Block Storage',
        'Cloud Firewall',
        'Disk Encryption',
        'Kubernetes',
        'Linodes',
        'LKE HA Control Planes',
        'Machine Images',
        'Managed Databases',
        'NodeBalancers',
        'Object Storage Access Key Regions',
        'Object Storage Endpoint Types',
        'Object Storage',
        'Placement Group',
        'Vlans',
      ],
    });
    mockAppendFeatureFlags({
      dbaasV2: { beta: false, enabled: false },
    });
    mockGetAccount(mockAccount);
  });

  databaseConfigurations.forEach(
    (configuration: databaseClusterConfiguration) => {
      describe(`updates a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
        /*
         * - Tests active database update UI flows using mocked data.
         * - Confirms that users can change database label.
         * - Confirms that users can change access controls.
         * - Confirms that users can reset root passwords.
         * - Confirms that users can change maintenance schedules.
         */
        it('Can update active database clusters', () => {
          const initialLabel = configuration.label;
          const updatedLabel = randomLabel();
          const allowedIp = randomIp();
          const newAllowedIp = randomIp();
          const initialPassword = randomString(16);
          const database = databaseFactory.build({
            allow_list: [allowedIp],
            engine: configuration.dbType,
            id: randomNumber(1, 1000),
            label: initialLabel,
            platform: 'rdbms-legacy',
            region: configuration.region.id,
            status: 'active',
            type: configuration.linodeType,
          });

          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockResetPassword(database.id, database.engine).as(
            'resetRootPassword'
          );
          mockGetDatabaseCredentials(
            database.id,
            database.engine,
            initialPassword
          ).as('getCredentials');

          cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
          cy.wait(['@getDatabase', '@getDatabaseTypes']);

          cy.get('[data-qa-cluster-config]').within(() => {
            cy.findByText(configuration.region.label).should('be.visible');
            cy.findByText(database.used_disk_size_gb + ' GB').should(
              'be.visible'
            );
            cy.findByText(database.total_disk_size_gb + ' GB').should(
              'be.visible'
            );
          });

          cy.get('[data-qa-connection-details]').within(() => {
            // "Show" button should be enabled to reveal password when DB is active.
            cy.findByText('Show')
              .closest('button')
              .should('be.visible')
              .should('be.enabled')
              .click();

            cy.wait('@getCredentials');
            cy.findByText(`= ${initialPassword}`);
          });

          mockUpdateDatabase(database.id, database.engine, {
            ...database,
            label: updatedLabel,
          }).as('updateDatabaseLabel');
          updateDatabaseLabel(initialLabel, updatedLabel);
          cy.wait('@updateDatabaseLabel');
          cy.get('[data-qa-header]')
            .should('be.visible')
            .should('have.text', updatedLabel);

          // Remove allowed IP, manage IP access control.
          mockUpdateDatabase(database.id, database.engine, {
            ...database,
            allow_list: [],
          }).as('updateDatabaseAllowedIp');
          removeAllowedIp(allowedIp);
          cy.wait('@updateDatabaseAllowedIp');

          mockUpdateDatabase(database.id, database.engine, {
            ...database,
            allow_list: [newAllowedIp],
          }).as('updateAccessControl');
          manageAccessControl([newAllowedIp]);
          cy.wait('@updateAccessControl');
          cy.get('[data-qa-access-controls]').within(() => {
            cy.findByText(newAllowedIp).should('be.visible');
          });

          // Navigate to "Settings" tab.
          ui.tabList.findTabByTitle('Settings').click();

          // Reset root password.
          resetRootPassword();
          cy.wait('@resetRootPassword');

          // Change maintenance.
          mockUpdateDatabase(database.id, database.engine, database).as(
            'updateDatabaseMaintenance'
          );
          cy.findByText('Monthly').should('be.visible').click();

          ui.button
            .findByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.wait('@updateDatabaseMaintenance');
          ui.toast.assertMessage(
            'Maintenance Window settings saved successfully.'
          );
        });

        /*
         * - Tests provisioning database update UI flows using mocked data.
         * - Confirms that database update flows work under error conditions.
         * - Confirms that users cannot change database label for provisioning DBs.
         * - Confirms that users cannot change access controls for provisioning DBs.
         * - Confirms that users cannot reset root passwords for provisioning DBs.
         * - Confirms that users cannot change maintenance schedules for provisioning DBs.
         */
        it('Cannot update database clusters while they are provisioning', () => {
          const initialLabel = configuration.label;
          const updateAttemptLabel = randomLabel();
          const allowedIp = randomIp();
          const database = databaseFactory.build({
            allow_list: [allowedIp],
            engine: configuration.dbType,
            hosts: {
              primary: undefined,
              secondary: undefined,
            },
            id: randomNumber(1, 1000),
            label: initialLabel,
            platform: 'rdbms-legacy',
            region: configuration.region.id,
            status: 'provisioning',
            type: configuration.linodeType,
          });

          const errorMessage =
            'Your database is provisioning; please wait until provisioning is complete to perform this operation.';
          const hostnameRegex = /your hostnames? will appear here once (it is|they are) available./i;

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');

          mockUpdateProvisioningDatabase(
            database.id,
            database.engine,
            errorMessage
          ).as('updateDatabase');

          mockResetPasswordProvisioningDatabase(
            database.id,
            database.engine,
            errorMessage
          ).as('resetRootPassword');

          cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
          cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);

          // Cannot update database label.
          updateDatabaseLabel(initialLabel, updateAttemptLabel);
          cy.wait('@updateDatabase');
          cy.findByText(errorMessage).should('be.visible');
          cy.get('[data-qa-cancel-edit="true"]')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.get('[data-qa-connection-details]').within(() => {
            // DBaaS hostnames are not available until database/cluster has provisioned.
            cy.findByText(hostnameRegex).should('be.visible');

            // DBaaS passwords cannot be revealed until database/cluster has provisioned.
            cy.findByText('Show')
              .closest('button')
              .should('be.visible')
              .should('be.disabled');
          });

          // Cannot add or remove allowed IPs before database/cluster has provisioned.
          removeAllowedIp(allowedIp);
          cy.wait('@updateDatabase');
          ui.dialog
            .findByTitle(`Remove IP Address ${allowedIp}`)
            .should('be.visible')
            .within(() => {
              cy.findByText(errorMessage).should('be.visible');
              ui.buttonGroup
                .findButtonByTitle('Cancel')
                .should('be.visible')
                .click();
            });

          manageAccessControl([randomIp()], 1);
          cy.wait('@updateDatabase');
          ui.drawer.findByTitle('Manage Access').within(() => {
            cy.findByText(errorMessage).should('be.visible');
            ui.drawerCloseButton.find().click();
          });

          // Navigate to "Settings" tab.
          ui.tabList.findTabByTitle('Settings').click();

          // Cannot reset root password before database/cluster has provisioned.
          resetRootPassword();
          cy.wait('@resetRootPassword');
          ui.dialog
            .findByTitle('Reset Root Password')
            .should('be.visible')
            .within(() => {
              cy.findByText(errorMessage).should('be.visible');

              ui.buttonGroup
                .findButtonByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
            });

          // Cannot change maintenance schedule before database/cluster has provisioned.
          cy.findByText('Monthly').should('be.visible').click();

          ui.button
            .findByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.wait('@updateDatabase');
          cy.findByText(errorMessage).should('be.visible');
        });
      });
    }
  );
});
