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
      ui.button.findByTitle('Upgrade Version').should('be.visible');
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
  cy.findByTitle('Save Changes').should('be.visible').should('be.disabled');

  ui.autocomplete.findByLabel(label).should('be.visible').type(windowValue);
  cy.contains(windowValue).should('be.visible').click();
  ui.button.findByTitle('Save Changes').should('be.visible').click();
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
 * Validates no updates can be performed for a suspended or resuming cluster
 *
 * This requires that the cluster is 'Suspended' or 'Resuming'
 *
 * @param engine - db engine
 * @param id - cluster id
 * @param initialLabel - cluster name
 * @param updateAttemptLabel - cluster updated name
 * @param errorMessage - error thrown for updating a suspended/resuming cluster
 * @param hostnameRegex - connection settings hostname
 * @param allowedIp - ip for manage access actions
 */

const validateSuspendResume = (
  engine: string,
  id: number,
  initialLabel: string,
  updateAttemptLabel: string,
  errorMessage: string,
  hostnameRegex: RegExp,
  allowedIp: string
) => {
  cy.visit(`/databases/${engine}/${id}`);
  cy.wait('@getDatabase');

  // Cannot update label when database/cluster is suspended or resuming.
  updateDatabaseLabel(initialLabel, updateAttemptLabel);
  cy.wait('@updateDatabase');
  cy.findByText(errorMessage).should('be.visible');
  cy.get('[data-qa-cancel-edit="true"]')
    .should('be.visible')
    .should('be.enabled')
    .click();

  cy.findByText('Connection Details');
  // DBaaS hostnames are not available when database/cluster is suspended or resuming.
  cy.findByText(hostnameRegex).should('be.visible');

  // DBaaS passwords cannot be revealed when database/cluster is suspended or resuming.
  ui.button.findByTitle('Show').should('be.visible').should('be.enabled');

  // Navigate to "Settings" tab.
  ui.tabList.findTabByTitle('Settings').click();

  // Cannot reset root password when database/cluster is suspended or resuming.
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

  // Cannot add or remove allowed IPs when database/cluster is suspended or resuming.
  removeAllowedIp(allowedIp);
  cy.wait('@updateDatabase');
  ui.dialog
    .findByTitle(`Remove IP Address ${allowedIp}`)
    .should('be.visible')
    .within(() => {
      cy.findByText(errorMessage).should('be.visible');
      ui.buttonGroup.findButtonByTitle('Cancel').should('be.visible').click();
    });

  manageAccessControl([randomIp()], 1);
  cy.wait('@updateDatabase');
  ui.drawer.findByTitle('Manage Access').within(() => {
    cy.findByText(errorMessage).should('be.visible');
    ui.drawerCloseButton.find().click();
  });

  // Cannot change maintenance schedule when database/cluster is suspended or resuming.
  modifyMaintenanceWindow('Day of Week', 'Wednesday');
  cy.wait('@updateDatabase');
  cy.findByText(errorMessage).should('be.visible');
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
  databaseConfigurations.forEach(
    (configuration: DatabaseClusterConfiguration) => {
      describe(`updates a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
        /*
         * - Tests active database update UI flows using mocked data.
         * - Confirms that users can change database label.
         * - Confirms that users can change access controls.
         * - Confirms that users can reset root passwords for active clusters.
         * - Confirms that users can change maintenance schedules.
         */
        it(`Can update active database clusters`, () => {
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
            platform: 'rdbms-default',
            region: configuration.region.id,
            status: 'active',
            type: configuration.linodeType,
            version: configuration.version,
          });

          mockGetAccount(accountFactory.build()).as('getAccount');
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

          // Validation for summary page details
          cy.findByText('Cluster Configuration');
          cy.findByText(configuration.region.label).should('be.visible');
          cy.findByText(database.total_disk_size_gb + ' GB').should(
            'be.visible'
          );

          cy.findByText('Connection Details');
          // "Show" button should be enabled to reveal password when DB is active.
          ui.button
            .findByTitle('Show')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.wait('@getCredentials');
          cy.findByText(`${initialPassword}`);

          // "Hide" button should be enabled to hide password when password is revealed.
          ui.button
            .findByTitle('Hide')
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Update labels for cluster in active/provisioning state
          mockUpdateDatabase(database.id, database.engine, {
            ...database,
            label: updatedLabel,
          }).as('updateDatabaseLabel');
          updateDatabaseLabel(initialLabel, updatedLabel);
          cy.wait('@updateDatabaseLabel');
          cy.get('[data-qa-header]')
            .should('be.visible')
            .should('have.text', updatedLabel);

          // Navigate to "Settings" tab.
          ui.tabList.findTabByTitle('Settings').click();

          // Reset root password.
          resetRootPassword();
          cy.wait('@resetRootPassword');

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

          // Change maintenance window and databe version upgrade.
          mockUpdateDatabase(database.id, database.engine, database).as(
            'updateDatabaseMaintenance'
          );
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

        /*
         * - Tests provisioning database update UI flows using mocked data.
         * - Confirms that users can change database label.
         * - Confirms that users can change access controls.
         * - Confirms that users cannot reset root passwords for provisioning clusters.
         * - Confirms that users can change maintenance schedules.
         */

        it(`Can update provisioning database clusters`, () => {
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
            platform: 'rdbms-default',
            region: configuration.region.id,
            status: 'provisioning',
            type: configuration.linodeType,
            version: configuration.version,
          });

          const errorMessage =
            'Database still provisioning; please try again later.';

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockResetPasswordProvisioningDatabase(
            database.id,
            database.engine,
            errorMessage
          ).as('resetRootPassword');
          mockGetDatabaseCredentials(
            database.id,
            database.engine,
            initialPassword
          ).as('getCredentials');

          cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
          cy.wait(['@getDatabase', '@getDatabaseTypes']);

          // Validation for summary page details
          cy.findByText('Cluster Configuration');
          cy.findByText(configuration.region.label).should('be.visible');
          cy.findByText(database.total_disk_size_gb + ' GB').should(
            'be.visible'
          );

          cy.findByText('Connection Details');
          // DBaaS passwords cannot be revealed until database/cluster has provisioned.
          ui.button
            .findByTitle('Show')
            .should('be.visible')
            .should('be.disabled');

          // Update labels for cluster in active/provisioning state
          mockUpdateDatabase(database.id, database.engine, {
            ...database,
            label: updatedLabel,
          }).as('updateDatabaseLabel');
          updateDatabaseLabel(initialLabel, updatedLabel);
          cy.wait('@updateDatabaseLabel');
          cy.get('[data-qa-header]')
            .should('be.visible')
            .should('have.text', updatedLabel);

          // Navigate to "Settings" tab.
          ui.tabList.findTabByTitle('Settings').click();

          // Reset root password.
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

          // Change maintenance window and databe version upgrade.
          mockUpdateDatabase(database.id, database.engine, database).as(
            'updateDatabaseMaintenance'
          );
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

          cy.get('[data-qa-settings-button="Suspend Cluster"]').should(
            'be.disabled'
          );
        });

        /*
         * - Tests suspend/resume database update UI flows using mocked data.
         * - Confirms that database update flows work under error conditions.
         * - Confirms that users cannot change database label for suspended DBs.
         * - Confirms that users cannot change access controls for suspended DBs.
         * - Confirms that users cannot reset root passwords for suspended DBs.
         * - Confirms that users cannot change maintenance schedules for suspended DBs.
         */
        it(`Cannot update database clusters while they are suspended via Settings`, () => {
          const initialLabel = configuration.label;
          const updateAttemptLabel = randomLabel();
          const allowedIp = randomIp();
          const database: Database = databaseFactory.build({
            allow_list: [allowedIp],
            engine: configuration.dbType,
            hosts: {
              primary: undefined,
              secondary: undefined,
            },
            id: randomNumber(1, 1000),
            label: initialLabel,
            platform: 'rdbms-default',
            region: configuration.region.id,
            status: 'active',
            type: configuration.linodeType,
          });

          const errorMessage =
            'Your database is suspended; please wait until it becomes active to perform this operation.';
          const hostnameRegex =
            /your hostnames? will appear here once (it is|they are) available./i;

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');

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

          mockSuspendDatabase(database.id, database.engine).as(
            'suspendDatabase'
          );

          // Database mock once instance has been suspended.
          const databaseMockSuspend: Database = {
            ...database,
            status: 'suspended',
          };

          cy.visitWithLogin(
            `/databases/${database.engine}/${database.id}/Settings`
          );
          cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);

          // Navigate to "Settings" tab.
          ui.tabList.findTabByTitle('Settings').click();

          // Suspend an active cluster
          cy.get('[data-qa-settings-button="Suspend Cluster"]').click();
          suspendCluster(initialLabel);
          cy.wait('@suspendDatabase');

          cy.url().should('endWith', '/databases');
          ui.toast.assertMessage('Database Cluster suspended successfully.');

          // Mock next request to fetch databases so that instance appears suspended.
          mockGetDatabases([databaseMockSuspend]).as('getDatabases');

          cy.findByText(database.label).should('be.visible');

          // Mock database with updated action - Suspend
          mockGetDatabase(databaseMockSuspend).as('getDatabase');
          cy.wait('@getDatabase');

          // Confirm enabled dropdown option when cluster is in suspended state
          validateActionItems('suspended', initialLabel);

          // Validate updates are not allowed when a cluster is suspended
          validateSuspendResume(
            database.engine,
            database.id,
            initialLabel,
            updateAttemptLabel,
            errorMessage,
            hostnameRegex,
            allowedIp
          );
        });

        /*
         * - Tests suspend/resume database update UI flows using mocked data.
         * - Confirms that database update flows work under error conditions.
         * - Confirms that users cannot change database label for suspended/resuming DBs.
         * - Confirms that users cannot change access controls for suspended/resuming DBs.
         * - Confirms that users cannot reset root passwords for suspended/resuming DBs.
         * - Confirms that users cannot change maintenance schedules for suspended/resuming DBs.
         */

        const actionItemState = ['suspended', 'resuming'];
        actionItemState.forEach((action) => {
          it(`Cannot update database clusters while they are ${action}`, () => {
            const currentState = action === 'resuming' ? 'suspended' : 'active';
            const initialLabel = configuration.label;
            const updateAttemptLabel = randomLabel();
            const allowedIp = randomIp();
            const database: Database = databaseFactory.build({
              allow_list: [allowedIp],
              engine: configuration.dbType,
              hosts: {
                primary: undefined,
                secondary: undefined,
              },
              id: randomNumber(1, 1000),
              label: initialLabel,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: currentState,
              type: configuration.linodeType,
            });

            const errorMessage = `Your database is ${action}; please wait until it becomes active to perform this operation.`;
            const hostnameRegex =
              /your hostnames? will appear here once (it is|they are) available./i;

            mockGetAccount(accountFactory.build()).as('getAccount');
            mockGetDatabases([database]).as('getDatabases');
            mockGetDatabase(database).as('getDatabase');
            mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');

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

            mockSuspendDatabase(database.id, database.engine).as(
              'suspendDatabase'
            );

            mockResumeDatabase(database.id, database.engine).as(
              'resumeDatabase'
            );

            const changeState =
              action === 'resuming' ? 'resuming' : 'suspended';

            // Database mock once instance has been suspended or resuming.
            const databaseMockSuspendResume: Database = {
              ...database,
              status: changeState,
            };

            cy.visitWithLogin(`/databases/`);
            cy.wait(['@getAccount', '@getDatabases', '@getDatabaseTypes']);

            cy.get(`[data-qa-database-cluster-id=${database.id}]`).within(
              () => {
                cy.findByText(initialLabel).should('be.visible');
              }
            );

            // Suspend/Resume cluster via action item menu on homepage
            ui.actionMenu
              .findByTitle(`Action menu for Database ${initialLabel}`)
              .should('be.visible')
              .click();

            const menuAction = action === 'resuming' ? 'Resume' : 'Suspend';

            ui.actionMenuItem
              .findByTitle(menuAction)
              .should('be.visible')
              .should('be.enabled')
              .click();

            if (action === 'resuming') {
              cy.wait('@resumeDatabase');
              ui.toast.assertMessage('Database Cluster resumed successfully.');
            } else {
              suspendCluster(initialLabel);
              cy.wait('@suspendDatabase');
              ui.toast.assertMessage(
                'Database Cluster suspended successfully.'
              );
            }

            // Mock next request to fetch databases so that instance appears suspended or resuming
            mockGetDatabases([databaseMockSuspendResume]).as('getDatabases');
            cy.wait('@getDatabases');

            cy.findByText(database.label).should('be.visible');

            // Mock database with updated action - Suspend/Resume
            mockGetDatabase(databaseMockSuspendResume).as('getDatabase');

            // Confirm enabled dropdown option when cluster is in suspended/resuming state
            validateActionItems(action, initialLabel);

            // Validate updates are not allowed when a cluster is suspended/resuming
            validateSuspendResume(
              database.engine,
              database.id,
              initialLabel,
              updateAttemptLabel,
              errorMessage,
              hostnameRegex,
              allowedIp
            );
          });
        });
      });
    }
  );
});
