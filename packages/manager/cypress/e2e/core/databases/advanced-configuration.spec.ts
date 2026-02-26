/**
 * @file DBaaS integration tests for advanced configuration operations.
 */

import { accountFactory } from '@src/factories';
import {
  databaseConfigurationsAdvConfig,
  mockDatabaseNodeTypes,
} from 'support/constants/databases';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetDatabase,
  mockGetDatabaseEngineConfigs,
  mockGetDatabaseTypes,
  mockUpdateDatabase,
  mockUpdateDatabaseError,
} from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { randomIp, randomNumber } from 'support/util/random';

import {
  databaseFactory,
  getEngineConfig,
  mysqlConfigResponse,
  postgresConfigResponse,
} from 'src/factories/databases';

import type {
  ConfigCategoryValues,
  DatabaseEngineConfig,
} from '@linode/api-v4';
import type { DatabaseClusterConfiguration } from 'support/constants/databases';

/**
 * Flattens default config map
 *
 * No assertion is made on the result of the flatten map attempt.
 *
 * @param engineConfig - Map of all advanced configuration engine specific
 */
const getFlattenDefaultConfigs = (
  engineConfig: Record<string, any>,
  prefix = ''
): string[] =>
  Object.entries(engineConfig).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? getFlattenDefaultConfigs(value, fullKey)
      : [fullKey];
  });

const flattenConfigsEngineLevel = (
  configs: Record<string, any>
): Record<string, any> => {
  const result: Record<string, any> = {};
  Object.entries(configs).forEach(([key, value]) => {
    if (
      typeof value === 'object' &&
      value !== null &&
      // Only flatten if value is a config group (not a config leaf)
      Object.values(value).every(
        (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
      )
    ) {
      // Nested group (e.g., pg, mysql)
      Object.entries(value).forEach(([subKey, subValue]) => {
        result[subKey] = subValue;
      });
    } else {
      // Top-level config
      result[key] = value;
    }
  });
  return result;
};

/**
 * Get list of advanced Configurations available for users to add/modify
 *
 * @param engine - Database cluster engine
 */
const getMockConfigs = (engine: string) => {
  return engine === 'mysql' ? mysqlConfigResponse : postgresConfigResponse;
};

/**
 * Get list of engine specific default configs
 *
 * @param database - Database cluster
 */
const getExistingConfigs = (database: any) => {
  return database.engine === 'mysql'
    ? database.engine_config.mysql
    : database.engine_config.pg;
};

/**
 * Get engine type depending on the database cluster's engine
 *
 * @param engine - Database cluster engine
 */
const getEngineType = (engine: string) => (engine === 'mysql' ? 'mysql' : 'pg');

/**
 * Configure and add configs to the database cluster
 *
 * @param configsList - Map of all the configs that can be added
 * @param database - database cluster
 * @param engineType - database cluster engine
 * @param addSingle - flag if single or multiple configs have to be added
 */
const addConfigsToUI = (
  configsList: Record<string, any>,
  database: Record<string, any>,
  engineType: string,
  addSingle = false
) => {
  const additionalConfigs: Record<string, any> = {};
  let requiresRestart = false;

  const getConfigValue = (value: any) =>
    value.minimum !== undefined
      ? value.minimum
      : value.type === 'boolean'
        ? false
        : value.example;

  // Process new configs to be added
  const newEntries = Object.entries(configsList)
    .filter(([key]) => {
      // Check both the engine subfield and the top-level for the config key
      return (
        !(key in database.engine_config[engineType]) &&
        !(key in database.engine_config)
      );
    })
    .slice(0, addSingle ? 1 : undefined); // Limit to 1 if addSingle, otherwise all

  if (newEntries.length > 0) {
    // Add new configs
    newEntries.forEach(([flatKey, value]) => {
      additionalConfigs[flatKey] = getConfigValue(value);

      // Check if the newly added config needs a restart on update
      if (value.requires_restart !== false) {
        requiresRestart = true;
      }

      ui.drawer
        .findByTitle('Advanced Configuration')
        .should('be.visible')
        .within(() => {
          // Confirms configure drawer already renders default configs
          Object.keys(database.engine_config[engineType]).forEach((key) => {
            cy.findByText(`${engineType}.${key}`).scrollIntoView();
            cy.findByText(`${engineType}.${key}`).should('be.visible');
          });
          Object.keys(database.engine_config)
            .filter(
              (key) =>
                key !== 'pg' &&
                key !== 'mysql' &&
                typeof database.engine_config[key] !== 'object'
            )
            .forEach((key) => {
              cy.findByText(key).scrollIntoView();
              cy.findByText(key).should('be.visible');
            });

          // Adding configs one at a time from the dropdown
          cy.get(
            '[data-qa-textfield-label="Add a Configuration Option"]'
          ).scrollIntoView();
          cy.get('[data-qa-textfield-label="Add a Configuration Option"]')
            .should('be.visible')
            .type(flatKey);

          cy.contains(flatKey).should('be.visible').click();

          ui.cdsButton.findButtonByTitle('Add').then((btn) => {
            btn[0].click(); // Native DOM click
          });

          // Type value for non-boolean configs
          if (value.type !== 'boolean') {
            cy.contains(flatKey).scrollIntoView();
            cy.contains(flatKey)
              .should('be.visible')
              .parent()
              .within(() => {
                if (value.enum) {
                  cy.get('[data-qa-autocomplete] input').click();
                  cy.get('[data-qa-autocomplete] input').clear();
                  cy.get('[data-qa-autocomplete] input').type(
                    `${additionalConfigs[flatKey]}`
                  );
                  ui.autocompletePopper
                    .findByTitle(`${additionalConfigs[flatKey]}`)
                    .click();
                } else {
                  cy.get(`[name="${flatKey}"]`).clear();
                  cy.get(`[name="${flatKey}"]`).type(
                    `${additionalConfigs[flatKey]}`
                  );
                }
              });
          }
        });
    });
  }
  return {
    additionalConfigs,
    saveButton: requiresRestart ? 'Save and Restart Service' : 'Save',
  };
};

describe('Update database clusters', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      databaseAdvancedConfig: {
        enabled: true,
      },
    });
  });

  databaseConfigurationsAdvConfig.forEach(
    (configuration: DatabaseClusterConfiguration) => {
      describe(`Advanced configurations for a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
        /*
         * - Tests active database advanced configuration UI flows using mocked data.
         * - Confirms initial state of the advanced configuraiton tab
         * - Confirms default configs for an engine
         */
        it('Initial advanced configurations state of an active database clusters', () => {
          const initialLabel = configuration.label;
          const allowedIp = randomIp();
          const database = databaseFactory
            .extend({
              allow_list: [allowedIp],
              engine: configuration.dbType,
              id: randomNumber(1, 1000),
              label: initialLabel,
              cluster_size: configuration.clusterSize,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: 'active',
              type: configuration.linodeType,
              version: configuration.version,
              engine_config: getEngineConfig(configuration.dbType),
            })
            .build();

          // Get mockConfigs to render Advanced Configuration drawer autofill dropdown
          const mockConfigs: DatabaseEngineConfig = getMockConfigs(
            database.engine
          );

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockGetDatabaseEngineConfigs(database.engine, mockConfigs);

          cy.visitWithLogin(
            `/databases/${database.engine}/${database.id}/configs`
          );
          cy.wait(['@getDatabase', '@getDatabaseTypes']);

          // Get an arrayy of all the default configs for an engine
          const defaultEngineConfig = getFlattenDefaultConfigs(
            getEngineConfig(configuration.dbType)
          );

          // Confirm all the default configs rendered in the Advanced Configuration tab
          defaultEngineConfig.forEach((defaultConfig: string) => {
            cy.findByText(defaultConfig).should('be.visible');
          });

          // Confirms all the buttons are in the initial state - enabled/disabled
          ui.cdsButton.findButtonByTitle('Configure').scrollIntoView();
          ui.cdsButton
            .findButtonByTitle('Configure')
            .should('be.visible')
            .should('be.enabled')
            .click();

          ui.drawer.findByTitle('Advanced Configuration').should('be.visible');
          ui.cdsButton
            .findButtonByTitle('Add')
            .should('exist')
            .should('be.disabled');
          ui.button.findByTitle('Save').should('exist').should('be.disabled');

          ui.button
            .findByTitle('Cancel')
            .should('exist')
            .should('be.enabled')
            .then((btn) => {
              btn[0].click();
            });

          ui.cdsButton
            .findButtonByTitle('Configure')
            .should('be.visible')
            .should('be.enabled')
            .click();

          ui.drawer.findByTitle('Advanced Configuration').should('be.visible');
          cy.get('[aria-label="Close drawer"]')
            .should('exist')
            .should('be.enabled')
            .then((btn) => {
              btn[0].click();
            });
        });

        /*
         * - Tests active database advanced configuration UI flows using mocked data.
         * - Confirms adding 1 advanced configuration to the exisiting database cluster
         * - Confirms new configuration is added to the Array of existing advanced configurations
         */
        it('Add advanced configurations with pre-defined value to an active database clusters', () => {
          const initialLabel = configuration.label;
          const allowedIp = randomIp();
          const database = databaseFactory
            .extend({
              allow_list: [allowedIp],
              engine: configuration.dbType,
              id: randomNumber(1, 1000),
              label: initialLabel,
              cluster_size: configuration.clusterSize,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: 'active',
              type: configuration.linodeType,
              version: configuration.version,
              engine_config: getEngineConfig(configuration.dbType),
            })
            .build();

          // Get engine specific default configs to append when updating advanced configuration
          const existingConfig = getExistingConfigs(database);
          // Prefix as per database cluster engine
          const engineType = getEngineType(database.engine);
          // Get mockConfigs to render Advanced Configuration drawer autofill dropdown
          const mockConfigs: DatabaseEngineConfig = getMockConfigs(
            database.engine
          );

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockGetDatabaseEngineConfigs(database.engine, mockConfigs);

          cy.visitWithLogin(
            `/databases/${database.engine}/${database.id}/configs`
          );
          cy.wait(['@getDatabase', '@getDatabaseTypes']);

          // Expand configure drawer to add configs
          ui.cdsButton.findButtonByTitle('Configure').scrollIntoView();
          ui.cdsButton
            .findButtonByTitle('Configure')
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Add configs from the configList to the existing database cluster
          const {
            additionalConfigs: singleConfig,
            saveButton: saveRestartButton,
          } = addConfigsToUI(
            mockConfigs[engineType],
            database,
            engineType,
            true
          );

          const isSyncReplicationQuorum =
            singleConfig['synchronous_replication'] === 'quorum';
          const isInvaliClusterSize =
            database.cluster_size < 3 && isSyncReplicationQuorum;

          // Update advanced configurations with the newly added config
          if (isInvaliClusterSize) {
            mockUpdateDatabaseError(
              database.id,
              database.engine,
              'engine_config.synchronous_replication',
              'synchronous_replication is only supported for clusters with 3 nodes'
            ).as('updateAdvancedConfiguration');
          } else {
            mockUpdateDatabase(database.id, database.engine, {
              ...database,
              engine_config: {
                ...(database.engine_config as ConfigCategoryValues),
                [engineType]: {
                  ...(existingConfig as ConfigCategoryValues),
                  ...singleConfig,
                },
              },
            }).as('updateAdvancedConfiguration');
          }
          // Save or Save and Restart Services as per the config added
          ui.button
            .findByTitle(saveRestartButton)
            .should('exist')
            .should('be.enabled')
            .then((btn) => {
              btn[0].click();
            });
          cy.wait('@updateAdvancedConfiguration');

          if (isInvaliClusterSize) {
            // Verify error message is displayed for invalid synchronous replication
            cy.findByText(
              /synchronous_replication is only supported for clusters with 3 nodes/i
            ).should('be.visible');
          } else {
            // Confirms newly added advanced Config on the Configuration tab tableview
            cy.findByText(
              `${engineType}.${Object.keys(singleConfig)[0]}`
            ).should('be.visible');
          }
        });

        /*
         * - Tests active database advanced configuration UI flows using mocked data.
         * - Confirms adding multiple advanced configuration to the exisiting database cluster
         * - Confirms new configuration is added to the Array of existing advanced configurations
         */
        it('Add multiple advanced configurations to an active database clusters', () => {
          const initialLabel = configuration.label;
          const allowedIp = randomIp();
          const database = databaseFactory
            .extend({
              allow_list: [allowedIp],
              engine: configuration.dbType,
              id: randomNumber(1, 1000),
              label: initialLabel,
              cluster_size: configuration.clusterSize,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: 'active',
              type: configuration.linodeType,
              version: configuration.version,
              engine_config: getEngineConfig(configuration.dbType),
            })
            .build();

          // Get engine specific default configs to append when updating advanced configuration
          const existingConfig = getExistingConfigs(database);
          // Prefix as per database cluster engine
          const engineType = getEngineType(database.engine);
          // Get mockConfigs to render Advanced Configuration drawer autofill dropdown
          const mockConfigs: DatabaseEngineConfig = getMockConfigs(
            database.engine
          );

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockGetDatabaseEngineConfigs(database.engine, mockConfigs);

          cy.visitWithLogin(
            `/databases/${database.engine}/${database.id}/configs`
          );
          cy.wait(['@getDatabase', '@getDatabaseTypes']);

          // Expand configure drawer to add configs
          ui.cdsButton.findButtonByTitle('Configure').scrollIntoView();
          ui.cdsButton
            .findButtonByTitle('Configure')
            .should('be.visible')
            .should('be.enabled')
            .click();

          const flatMockConfigs = flattenConfigsEngineLevel(mockConfigs);

          // Add configs from the configList to the existing database cluster
          const {
            additionalConfigs: allConfig,
            saveButton: saveRestartButton,
          } = addConfigsToUI(flatMockConfigs, database, engineType, false);

          const nestedConfig: Record<string, any> = {};
          const topLevelConfig: Record<string, any> = {};
          // Separate nested engine configs and top-level configs
          Object.entries(allConfig).forEach(([key, value]) => {
            if (key in mockConfigs[engineType]) {
              nestedConfig[key] = value;
            } else {
              topLevelConfig[key] = value;
            }
          });

          const isSyncReplicationQuorum =
            allConfig['synchronous_replication'] === 'quorum';
          const isInvalidClusterSize =
            database.cluster_size < 3 && isSyncReplicationQuorum;

          // Update advanced configurations with the newly added config
          if (isInvalidClusterSize) {
            mockUpdateDatabaseError(
              database.id,
              database.engine,
              'engine_config.synchronous_replication',
              'synchronous_replication is only supported for clusters with 3 nodes'
            ).as('updateAdvancedConfiguration');
          } else {
            mockUpdateDatabase(database.id, database.engine, {
              ...database,
              engine_config: {
                ...(database.engine_config as ConfigCategoryValues),
                [engineType]: {
                  ...(existingConfig as ConfigCategoryValues),
                  ...nestedConfig,
                },
                ...topLevelConfig,
              },
            }).as('updateAdvancedConfiguration');
          }

          // Save or Save and Restart Services as per the config added
          ui.button
            .findByTitle(saveRestartButton)
            .should('exist')
            .should('be.enabled')
            .then((btn) => {
              btn[0].click();
            });
          cy.wait('@updateAdvancedConfiguration');

          if (isInvalidClusterSize) {
            // Verify error message is displayed for invalid synchronous replication
            cy.findByText(
              /synchronous_replication is only supported for clusters with 3 nodes/i
            ).should('be.visible');
          } else {
            // Confirms newly added advanced Config on the Configuration tab tableview
            Object.keys(nestedConfig).forEach((key) => {
              cy.findByText(`${engineType}.${key}`).should('be.visible');
            });
            Object.keys(topLevelConfig).forEach((key) => {
              cy.findByText(`${key}`).should('be.visible');
            });
          }
        });

        /*
         * - Tests active database advanced configuration UI flows using mocked data.
         * - Confirms negative inline validations for advanced configurationv values
         */
        it('Negative validations for advanced configurations values in an active database clusters', () => {
          const initialLabel = configuration.label;
          const allowedIp = randomIp();
          const database = databaseFactory
            .extend({
              allow_list: [allowedIp],
              engine: configuration.dbType,
              id: randomNumber(1, 1000),
              label: initialLabel,
              cluster_size: configuration.clusterSize,
              platform: 'rdbms-default',
              region: configuration.region.id,
              status: 'active',
              type: configuration.linodeType,
              version: configuration.version,
              engine_config: getEngineConfig(configuration.dbType),
            })
            .build();

          // Prefix as per database cluster engine
          const engineType = getEngineType(database.engine);
          // Get mockConfigs to render Advanced Configuration drawer autofill dropdown
          const mockConfigs: DatabaseEngineConfig = getMockConfigs(
            database.engine
          );

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockGetDatabaseEngineConfigs(database.engine, mockConfigs);

          cy.visitWithLogin(
            `/databases/${database.engine}/${database.id}/configs`
          );
          cy.wait(['@getDatabase', '@getDatabaseTypes']);

          // Expand configure drawer to add configs
          ui.cdsButton.findButtonByTitle('Configure').scrollIntoView();
          ui.cdsButton
            .findButtonByTitle('Configure')
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Add configs from the configList to the existing database cluster
          ui.drawer
            .findByTitle('Advanced Configuration')
            .should('be.visible')
            .within(() => {
              for (const [flatKey, value] of Object.entries(
                mockConfigs[engineType]
              )) {
                if (
                  !Object.keys(database.engine_config[engineType]).includes(
                    flatKey
                  ) &&
                  value.type == 'integer' &&
                  value.minimum != undefined &&
                  value.maximum != undefined
                ) {
                  cy.get(
                    '[data-qa-textfield-label="Add a Configuration Option"]'
                  ).scrollIntoView();
                  cy.get(
                    '[data-qa-textfield-label="Add a Configuration Option"]'
                  )
                    .should('be.visible')
                    .type(flatKey);

                  cy.contains(flatKey).should('be.visible').click();

                  ui.cdsButton.findButtonByTitle('Add').then((btn) => {
                    btn[0].click(); // Native DOM click
                  });

                  // Validate value for inline minimum limit
                  cy.get(`[name="${flatKey}"]`).scrollIntoView();
                  cy.get(`[name="${flatKey}"]`).should('be.visible').clear();
                  cy.get(`[name="${flatKey}"]`).type(`${value.minimum - 1}`);
                  cy.get(`[name="${flatKey}"]`).blur();
                  cy.findByText(`${flatKey} must be at least ${value.minimum}`);

                  // Validate value for inline maximum limit
                  cy.get(`[name="${flatKey}"]`).should('be.visible').clear();
                  cy.get(`[name="${flatKey}"]`).type(`${value.maximum + 1}`);
                  cy.get(`[name="${flatKey}"]`).blur();
                  cy.findByText(`${flatKey} must be at most ${value.maximum}`);

                  // Validate value for inline required field check
                  cy.get(`[name="${flatKey}"]`).should('be.visible').clear();
                  cy.get(`[name="${flatKey}"]`).blur();
                  cy.findByText(`${flatKey} is required`);

                  // Validate value for inline field type check
                  cy.get(`[name="${flatKey}"]`).should('be.visible').clear();
                  cy.get(`[name="${flatKey}"]`).type('abcd');
                  cy.get(`[name="${flatKey}"]`).blur();
                  cy.findByText(`${flatKey} is required`);
                }
              }
            });
        });
      });
    }
  );
});
