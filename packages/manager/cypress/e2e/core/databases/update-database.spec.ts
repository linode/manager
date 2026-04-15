/**
 * @file DBaaS integration tests for update operations.
 */

import { accountFactory } from '@src/factories';
import {
  databaseConfigurationsUpdate,
  mockDatabaseNodeTypes,
} from 'support/constants/databases';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetDatabase,
  mockGetDatabaseCredentials,
  mockGetDatabases,
  mockGetDatabaseTypes,
  mockResetPassword,
  mockResetPasswordProvisioningDatabase,
  mockResetPasswordSuspendResumeDatabase,
  mockResumeDatabase,
  mockSuspendDatabase,
  mockUpdateDatabase,
  mockUpdateSuspendResumeDatabase,
} from 'support/intercepts/databases';
import { ui } from 'support/ui';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';

import { databaseFactory } from 'src/factories/databases';

import type { Database } from '@linode/api-v4';
import type { DatabaseClusterConfiguration } from 'support/constants/databases';

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
  cy.get('[data-testid="button-access-control"]').within(() => {
    ui.cdsButton.findButtonByTitle('Manage Access').click();
  });

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
  ui.cdsButton
    .findButtonByTitle('Reset Root Password')
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

/**
 * Updates engine version if applicable and maintenance window for a given day and time.
 *
 * This requires that the 'Summary' or 'Settings' tab is currently active.
 *
 * @param engine - database engine for version upgrade.
 * @param version - current database engine version to be upgraded.
 */
const upgradeEngineVersion = (engine: string, version: string) => {
  const dbEngine = engine == 'mysql' ? 'MySQL' : 'PostgreSQL';
  cy.get('[data-qa-settings-section="Maintenance"]')
    .should('be.visible')
    .within(() => {
      cy.findByText('Maintenance');
      cy.findByText('Version');
      cy.findByText(`${dbEngine} v${version}`);
      ui.cdsButton.findButtonByTitle('Upgrade Version').should('be.visible');
    });
};

/**
 * Updates maintenance window for a given day and time.
 *
 * This requires that the 'Summary' or 'Settings' tab is currently active.
 * Assertion is made on the toast thrown while updating maintenance window.
 *
 * @param label - type of window (day/time) to update
 * @param windowValue - maintenance window value to update
 */
const modifyMaintenanceWindow = (label: string, windowValue: string) => {
  cy.findByText('Set a Weekly Maintenance Window');
  ui.cdsButton
    .findButtonByTitle('Save Changes')
    .should('be.visible')
    .should('be.disabled');

  // Open the dropdown via shadow DOM
  ui.cdsAutoComplete.findByLabel(label, 'input[role="combobox"]').click();

  // Select the value from the dropdown
  ui.cdsAutoComplete
    .findByLabel(label, '[role="listbox"]')
    .contains(windowValue)
    .click();

  ui.cdsButton.findButtonByTitle('Save Changes').then((btn) => {
    btn[0].click(); // Native DOM click
  });
};

/**
 * Suspend an active cluster
 *
 * @param label - cluster name
 */

const suspendCluster = (label: string) => {
  ui.dialog
    .findByTitle(`Suspend ${label} cluster?`)
    .should('be.visible')
    .within(() => {
      ui.buttonGroup
        .findButtonByTitle('Suspend Cluster')
        .should('be.visible')
        .should('be.disabled');

      cy.get('[data-qa-checked="false"]').click();

      ui.buttonGroup
        .findButtonByTitle('Suspend Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
};

/**
 * Returns the appropriate error message for a given database status.
 *
 * @param status - The database status.
 * @returns Error message string.
 */
const getBlockedErrorMessage = (status: string): string => {
  if (status === 'provisioning') {
    return 'Database still provisioning; please try again later.';
  }
  return `Your database is ${status}; please wait until it becomes active to perform this operation.`;
};

const validateActionItems = (state: string, label: string) => {
  const menuStates: Record<string, Record<string, boolean>> = {
    suspended: {
      Delete: true,
      'Manage Access Controls': false,
      'Reset Root Password': false,
      Resize: false,
      Resume: true,
      Suspend: false,
    },
    resuming: {
      Delete: true,
      'Manage Access Controls': true,
      'Reset Root Password': true,
      Resize: true,
      Resume: false,
      Suspend: false,
    },
  };
  const expectedItems = menuStates[state];
  ui.actionMenu
    .findByTitle(`Action menu for Database ${label}`)
    .should('be.visible')
    .click();

  Object.entries(expectedItems).forEach(([label, enabled]) => {
    ui.actionMenuItem
      .findByTitle(label)
      .should('be.visible')
      .should(enabled ? 'be.enabled' : 'be.disabled');
  });
  cy.get('body').click(0, 0);
};

describe('Update database clusters', () => {
  beforeEach(() => {
    mockGetAccount(accountFactory.build()).as('getAccount');
    mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
  });

  databaseConfigurationsUpdate.forEach(
    (configuration: DatabaseClusterConfiguration) => {
      describe(`${configuration.engine} ${configuration.clusterSize}-node cluster`, () => {
        // Test for statuses where updates are allowed (active, provisioning)
        const editableStatuses = ['active', 'provisioning'] as const;

        editableStatuses.forEach((status) => {
          describe(`${status} clusters`, () => {
            let database: Database;
            let allowedIp: string;
            let newAllowedIp: string;

            beforeEach(() => {
              allowedIp = randomIp();
              newAllowedIp = randomIp();
              database = databaseFactory.build({
                allow_list: [allowedIp],
                engine: configuration.dbType,
                id: randomNumber(1, 1000),
                label: configuration.label,
                platform: 'rdbms-default',
                region: configuration.region.id,
                status,
                type: configuration.linodeType,
                version: configuration.version,
              });

              mockGetDatabase(database).as('getDatabase');
            });

            // Test to update database label
            it(`Can update label when ${status}`, () => {
              const updatedLabel = randomLabel();

              mockUpdateDatabase(database.id, database.engine, {
                ...database,
                label: updatedLabel,
              }).as('updateDatabaseLabel');

              cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
              cy.wait(['@getDatabase', '@getDatabaseTypes']);

              updateDatabaseLabel(database.label, updatedLabel);
              cy.wait('@updateDatabaseLabel');
              cy.get('[data-qa-header]')
                .should('be.visible')
                .should('have.text', updatedLabel);
            });

            // Tests to update maintenance window and engine version (if applicable)
            it(`Can modify maintenance window when ${status}`, () => {
              mockUpdateDatabase(database.id, database.engine, database).as(
                'updateDatabaseMaintenance'
              );

              cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
              cy.wait(['@getDatabase', '@getDatabaseTypes']);

              ui.tabList.findTabByTitle('Settings').click();
              upgradeEngineVersion(database.engine, database.version);

              modifyMaintenanceWindow('Day of Week', 'Wednesday');
              cy.wait('@updateDatabaseMaintenance');
              ui.toast.assertMessage(
                'Maintenance Window settings saved successfully.'
              );

              modifyMaintenanceWindow('Time', '12:00');
              cy.wait('@updateDatabaseMaintenance');
              ui.toast.assertMessage(
                'Maintenance Window settings saved successfully.'
              );
            });

            // Test to manage access controls (add/remove allowed IPs)
            it(`Can manage access controls when ${status}`, () => {
              cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
              cy.wait(['@getDatabase', '@getDatabaseTypes']);

              ui.tabList.findTabByTitle('Networking').click();

              // Set up mock right before the action that triggers it
              mockUpdateDatabase(database.id, database.engine, {
                ...database,
                allow_list: [],
              }).as('updateDatabaseAllowedIp');

              removeAllowedIp(allowedIp);
              cy.wait('@updateDatabaseAllowedIp');

              // Set up next mock after first request completes
              mockUpdateDatabase(database.id, database.engine, {
                ...database,
                allow_list: [newAllowedIp],
              }).as('updateAccessControl');

              manageAccessControl([newAllowedIp]);
              cy.wait('@updateAccessControl');
              cy.get('[data-qa-access-controls]').within(() => {
                cy.findByText(newAllowedIp).should('be.visible');
              });
            });
          });
        });

        // Tests operations that are only allowed when cluster is active (show/hide password, reset root password)
        describe('active clusters - password operations', () => {
          it('Can view cluster details and show/hide password', () => {
            const initialPassword = randomString(16);
            const database = databaseFactory.build({
              allow_list: [randomIp()],
              engine: configuration.dbType,
              id: randomNumber(1, 1000),
              label: configuration.label,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: 'active',
              type: configuration.linodeType,
              version: configuration.version,
            });

            mockGetDatabase(database).as('getDatabase');
            mockGetDatabaseCredentials(
              database.id,
              database.engine,
              initialPassword
            ).as('getCredentials');

            cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
            cy.wait(['@getDatabase', '@getDatabaseTypes']);

            // Verify cluster configuration details
            cy.findByText('Cluster Configuration');
            cy.findByText(configuration.region.label).should('be.visible');
            cy.findByText(database.total_disk_size_gb + ' GB').should(
              'be.visible'
            );

            cy.findByText('Connection Details');
            ui.cdsButton.findButtonByTitle('Show').should('be.enabled').click();

            cy.wait('@getCredentials');
            cy.findByText(`${initialPassword}`);

            ui.cdsButton.findButtonByTitle('Hide').should('be.enabled').click();
          });

          it('Can reset root password when active', () => {
            const database = databaseFactory.build({
              allow_list: [randomIp()],
              engine: configuration.dbType,
              id: randomNumber(1, 1000),
              label: configuration.label,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: 'active',
              type: configuration.linodeType,
              version: configuration.version,
            });

            mockGetDatabase(database).as('getDatabase');
            mockResetPassword(database.id, database.engine).as(
              'resetRootPassword'
            );

            cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
            cy.wait(['@getDatabase', '@getDatabaseTypes']);

            ui.tabList.findTabByTitle('Settings').click();
            resetRootPassword();
            cy.wait('@resetRootPassword');
          });
        });

        // Tests operations that are blocked when cluster is provisioning (show/hide password, reset root password, suspend cluster)
        describe('provisioning clusters - blocked operations', () => {
          it('Cannot reveal password or reset root password when provisioning', () => {
            const errorMessage = getBlockedErrorMessage('provisioning');
            const database = databaseFactory.build({
              allow_list: [randomIp()],
              engine: configuration.dbType,
              id: randomNumber(1, 1000),
              label: configuration.label,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: 'provisioning',
              type: configuration.linodeType,
              version: configuration.version,
            });

            mockGetDatabase(database).as('getDatabase');
            mockResetPasswordProvisioningDatabase(
              database.id,
              database.engine,
              errorMessage
            ).as('resetRootPassword');

            cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
            cy.wait(['@getDatabase', '@getDatabaseTypes']);

            // Cannot reveal password when provisioning
            cy.findByText('Connection Details');
            ui.cdsButton.findButtonByTitle('Show').should('be.disabled');

            // Navigate to Settings and verify blocked operations
            ui.tabList.findTabByTitle('Settings').click();

            cy.get('[data-testid="settings-button-Suspend Cluster"]').within(
              () => {
                ui.cdsButton
                  .findButtonByTitle('Suspend Cluster')
                  .should('be.disabled');
              }
            );

            // Cannot reset root password when provisioning
            resetRootPassword();
            cy.wait('@resetRootPassword');
            ui.dialog
              .findByTitle('Reset Root Password')
              .should('be.visible')
              .within(() => {
                cy.findByText(errorMessage).should('be.visible');
                ui.buttonGroup
                  .findButtonByTitle('Cancel')
                  .should('be.enabled')
                  .click();
              });
          });
        });

        // Tests operations that are blocked when cluster is suspended or resuming
        const blockedStatuses = ['suspended', 'resuming'] as const;

        blockedStatuses.forEach((status) => {
          describe(`${status} clusters`, () => {
            let database: Database;
            let allowedIp: string;
            let errorMessage: string;

            beforeEach(() => {
              allowedIp = randomIp();
              errorMessage = getBlockedErrorMessage(status);
              database = databaseFactory.build({
                allow_list: [allowedIp],
                engine: configuration.dbType,
                hosts: null,
                id: randomNumber(1, 1000),
                label: configuration.label,
                platform: 'rdbms-default',
                region: configuration.region.id,
                status,
                type: configuration.linodeType,
                version: configuration.version,
              });

              mockGetDatabase(database).as('getDatabase');
              mockUpdateSuspendResumeDatabase(
                database.id,
                database.engine,
                errorMessage
              ).as('updateDatabase');
              mockResetPasswordSuspendResumeDatabase(
                database.id,
                database.engine,
                errorMessage
              ).as('resetRootPassword');
            });

            // Tests to verify that update operations are blocked and appropriate error message is shown when cluster is not active
            it(`Cannot perform updates when ${status}`, () => {
              const updateAttemptLabel = randomLabel();

              cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
              cy.wait('@getDatabase');

              // Cannot update label
              updateDatabaseLabel(database.label, updateAttemptLabel);
              cy.wait('@updateDatabase');
              cy.findByText(errorMessage).should('be.visible');
              cy.get('[data-qa-cancel-edit="true"]')
                .should('be.enabled')
                .click();

              // Navigate to Settings tab
              ui.tabList.findTabByTitle('Settings').click();

              // Cannot reset password
              resetRootPassword();
              cy.wait('@resetRootPassword');
              ui.dialog
                .findByTitle('Reset Root Password')
                .should('be.visible')
                .within(() => {
                  cy.findByText(errorMessage).should('be.visible');
                  ui.buttonGroup
                    .findButtonByTitle('Cancel')
                    .should('be.enabled')
                    .click();
                });

              // Cannot modify maintenance window
              modifyMaintenanceWindow('Day of Week', 'Wednesday');
              cy.wait('@updateDatabase');
              cy.findByText(errorMessage).should('be.visible');

              // Navigate to Networking tab
              ui.tabList.findTabByTitle('Networking').click();

              // Cannot remove allowed IP
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

              // Cannot add new IP via manage access
              manageAccessControl([randomIp()], 1);
              cy.wait('@updateDatabase');
              ui.drawer.findByTitle('Manage Access').within(() => {
                cy.findByText(errorMessage).should('be.visible');
                ui.drawerCloseButton.find().click();
              });
            });

            it(`Action menu shows correct options when ${status}`, () => {
              mockGetDatabases([database]).as('getDatabases');

              cy.visitWithLogin('/databases/');
              cy.wait(['@getAccount', '@getDatabases', '@getDatabaseTypes']);

              validateActionItems(status, database.label);
            });
          });
        });

        // Tests state transitions (suspend/resume) via action menu and settings page
        describe('state transitions', () => {
          it('Can suspend via Settings', () => {
            const database = databaseFactory.build({
              allow_list: [randomIp()],
              engine: configuration.dbType,
              hosts: null,
              id: randomNumber(1, 1000),
              label: configuration.label,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: 'active',
              type: configuration.linodeType,
            });

            const databaseMockSuspend: Database = {
              ...database,
              status: 'suspended',
            };

            mockGetDatabase(database).as('getDatabase');
            mockSuspendDatabase(database.id, database.engine).as(
              'suspendDatabase'
            );
            mockGetDatabases([databaseMockSuspend]).as('getDatabases');

            cy.visitWithLogin(
              `/databases/${database.engine}/${database.id}/Settings`
            );
            cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);

            ui.tabList.findTabByTitle('Settings').click();

            cy.get('[data-testid="settings-button-Suspend Cluster"]').within(
              () => {
                ui.cdsButton
                  .findButtonByTitle('Suspend Cluster')
                  .should('be.enabled')
                  .click();
              }
            );
            suspendCluster(database.label);
            cy.wait('@suspendDatabase');

            cy.url().should('endWith', '/databases');
            ui.toast.assertMessage('Database Cluster suspended successfully.');

            cy.findByText(database.label).should('be.visible');

            mockGetDatabase(databaseMockSuspend).as('getDatabase');
            cy.wait('@getDatabase');

            validateActionItems('suspended', database.label);
          });

          it('Can suspend via action menu', () => {
            const database = databaseFactory.build({
              allow_list: [randomIp()],
              engine: configuration.dbType,
              hosts: null,
              id: randomNumber(1, 1000),
              label: configuration.label,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: 'active',
              type: configuration.linodeType,
            });

            const databaseMockSuspend: Database = {
              ...database,
              status: 'suspended',
            };

            mockGetDatabases([database]).as('getDatabases');
            mockGetDatabase(database).as('getDatabase');
            mockSuspendDatabase(database.id, database.engine).as(
              'suspendDatabase'
            );

            cy.visitWithLogin('/databases/');
            cy.wait(['@getAccount', '@getDatabases', '@getDatabaseTypes']);

            cy.get(`[data-qa-database-cluster-id=${database.id}]`).within(
              () => {
                cy.findByText(database.label).should('be.visible');
              }
            );

            ui.actionMenu
              .findByTitle(`Action menu for Database ${database.label}`)
              .should('be.visible')
              .click();

            ui.actionMenuItem
              .findByTitle('Suspend')
              .should('be.enabled')
              .click();

            suspendCluster(database.label);
            cy.wait('@suspendDatabase');
            ui.toast.assertMessage('Database Cluster suspended successfully.');

            // Set up mock for subsequent requests and verify action menu
            mockGetDatabases([databaseMockSuspend]).as('getDatabases');
            mockGetDatabase(databaseMockSuspend).as('getDatabase');
            validateActionItems('suspended', database.label);
          });

          it('Can resume via action menu', () => {
            const database = databaseFactory.build({
              allow_list: [randomIp()],
              engine: configuration.dbType,
              hosts: null,
              id: randomNumber(1, 1000),
              label: configuration.label,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: 'suspended',
              type: configuration.linodeType,
            });

            const databaseMockResuming: Database = {
              ...database,
              status: 'resuming',
            };

            mockGetDatabases([database]).as('getDatabases');
            mockGetDatabase(database).as('getDatabase');
            mockResumeDatabase(database.id, database.engine).as(
              'resumeDatabase'
            );

            cy.visitWithLogin('/databases/');
            cy.wait(['@getAccount', '@getDatabases', '@getDatabaseTypes']);

            cy.get(`[data-qa-database-cluster-id=${database.id}]`).within(
              () => {
                cy.findByText(database.label).should('be.visible');
              }
            );

            ui.actionMenu
              .findByTitle(`Action menu for Database ${database.label}`)
              .should('be.visible')
              .click();

            ui.actionMenuItem
              .findByTitle('Resume')
              .should('be.enabled')
              .click();

            cy.wait('@resumeDatabase');
            ui.toast.assertMessage('Database Cluster resumed successfully.');

            // Set up mock for subsequent requests and verify action menu
            mockGetDatabases([databaseMockResuming]).as('getDatabases');
            mockGetDatabase(databaseMockResuming).as('getDatabase');
            validateActionItems('resuming', database.label);
          });
        });
      });
    }
  );
});
