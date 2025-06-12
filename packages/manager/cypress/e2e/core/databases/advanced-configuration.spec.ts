/**
 * @file DBaaS integration tests for advanced configuration operations.
 */

import { ConfigCategoryValues, DatabaseEngineConfig } from '@linode/api-v4';
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
    .filter(([key]) => !database.engine_config[engineType][key])
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
            cy.findByText(`${engineType}.${key}`).should('be.visible');
          });

          // Adding configs one at a time from the dropdown
          cy.get(
            '[data-qa-textfield-label="Add a Configuration Option"]'
          ).scrollIntoView();
          cy.get('[data-qa-textfield-label="Add a Configuration Option"]')
            .should('be.visible')
            .type(flatKey);

          cy.contains(flatKey).should('be.visible').click();

          ui.button.findByTitle('Add').click();

          // Type value for non-boolean configs
          if (value.type !== 'boolean') {
            cy.get(`[name="${flatKey}"]`).should('be.visible').clear();
            cy.get(`[name="${flatKey}"]`).type(additionalConfigs[flatKey]);
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
          mockGetDatabase(database).as('getDatabase').debug();
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

          // Confirms all teh buttons are in the initial state - enabled/disabled
          ui.button
            .findByTitle('Configure')
            .should('be.visible')
            .should('be.enabled')
            .click();

          ui.drawer.findByTitle('Advanced Configuration').should('be.visible');
          ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.disabled');
          ui.button
            .findByTitle('Save')
            .scrollIntoView()
            .should('be.visible')
            .should('be.disabled');

          ui.button
            .findByTitle('Cancel')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();

          ui.button
            .findByTitle('Configure')
            .should('be.visible')
            .should('be.enabled')
            .click();
          ui.drawer.findByTitle('Advanced Configuration').should('be.visible');
          cy.get('[aria-label="Close drawer"]')
            .should('be.visible')
            .should('be.enabled')
            .click();
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
          ui.button
            .findByTitle('Configure')
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

          // Update advanced configurations with the newly added config
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

          // Save or Save and Restart Services as per the config added
          ui.button
            .findByTitle(saveRestartButton)
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.wait('@updateAdvancedConfiguration');

          // Confirms newly added advacned Config on the Configuration tab tableview
          cy.findByText(`${engineType}.${Object.keys(singleConfig)[0]}`).should(
            'be.visible'
          );
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
          ui.button
            .findByTitle('Configure')
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Add configs from the configList to the existing database cluster
          const {
            additionalConfigs: allConfig,
            saveButton: saveRestartButton,
          } = addConfigsToUI(
            mockConfigs[engineType],
            database,
            engineType,
            false
          );

          // Update advanced configurations with the newly added config
          mockUpdateDatabase(database.id, database.engine, {
            ...database,
            engine_config: {
              ...(database.engine_config as ConfigCategoryValues),
              [engineType]: {
                ...(existingConfig as ConfigCategoryValues),
                ...allConfig,
              },
            },
          }).as('updateAdvancedConfiguration');

          // Save or Save and Restart Services as per the config added
          ui.button
            .findByTitle(saveRestartButton)
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.wait('@updateAdvancedConfiguration');

          // Confirms newly added advacned Config on the Configuration tab tableview
          Object.keys(allConfig).forEach((key) => {
            cy.findByText(`${engineType}.${key}`).should('be.visible');
          });
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
          ui.button
            .findByTitle('Configure')
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

                  ui.button.findByTitle('Add').click();

                  // Validate value for inline minimum limit
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
