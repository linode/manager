/**
 * @file DBaaS integration tests for advanced configuration operations.
 */

import { ConfigCategoryValues, DatabaseEngineConfig } from '@linode/api-v4';
import { accountFactory } from '@src/factories';
import {
  databaseConfigurations,
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

const flattenObject = (
  obj: Record<string, any>,
  prefix = '',
  result: Record<string, any> = {}
): Record<string, any> => {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const TRUE_VALUE = Boolean(true);
    const FALSE_VALUE = Boolean(false);
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenObject(value, fullKey, result);
    } else {
      const val =
        value === TRUE_VALUE
          ? 'Enabled'
          : value == FALSE_VALUE
            ? 'Disabled'
            : value;
      result[fullKey] = val;
    }
  }
  return result;
};

const validateDefaultEngineConfig = (defaultConfig: Record<string, string>) => {
  Object.entries(defaultConfig).forEach(([flatKey, value]) => {
    cy.findByText(flatKey).should('exist');
    cy.findByText(value).should('exist');
  });
};

describe('Update database clusters', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      databaseAdvancedConfig: {
        enabled: true,
      },
    });
  });
  databaseConfigurations.forEach(
    (configuration: DatabaseClusterConfiguration) => {
      describe(`Advanced configurations for a ${configuration.linodeType} ${configuration.engine} v${configuration.version}.x ${configuration.clusterSize}-node cluster`, () => {
        /*
         * - Tests active database advanced configuration UI flows using mocked data.
         * - Confirms that users can add new configs.
         * - Confirms that users can update existing configs.
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

          const mockConfigs: DatabaseEngineConfig =
            configuration.dbType === 'mysql'
              ? mysqlConfigResponse
              : postgresConfigResponse;

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase').debug();
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockGetDatabaseEngineConfigs(database.engine, mockConfigs);

          cy.visitWithLogin(
            `/databases/${database.engine}/${database.id}/configs`
          );
          cy.wait(['@getDatabase', '@getDatabaseTypes']);

          const defaultEngineConfig = flattenObject(
            getEngineConfig(configuration.dbType)
          );
          validateDefaultEngineConfig(defaultEngineConfig);

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

          const mockConfigs: DatabaseEngineConfig =
            configuration.dbType === 'mysql'
              ? mysqlConfigResponse
              : postgresConfigResponse;

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockGetDatabaseEngineConfigs(database.engine, mockConfigs);

          cy.visitWithLogin(
            `/databases/${database.engine}/${database.id}/configs`
          );
          cy.wait(['@getDatabase', '@getDatabaseTypes']);

          let config: string;
          let configValue: string;
          let saveButton: string;
          const existingConfig =
            database.engine === 'mysql'
              ? database.engine_config.mysql
              : database.engine_config.pg;
          const engineType = database.engine === 'mysql' ? 'mysql' : 'pg';

          ui.button
            .findByTitle('Configure')
            .should('be.visible')
            .should('be.enabled')
            .click();

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
                  )
                ) {
                  config = flatKey;
                  configValue = value.minimum;
                  saveButton =
                    value.requires_restart === false
                      ? 'Save'
                      : 'Save and Restart Service';

                  cy.get(
                    '[data-qa-textfield-label="Add a Configuration Option"]'
                  )
                    .should('be.visible')
                    .type(flatKey);
                  cy.contains(flatKey).should('be.visible').click();
                  ui.button.findByTitle('Add').click();
                  break;
                } else {
                  cy.log(`Config ${flatKey} already present.`);
                  cy.findByText(`${engineType}.${flatKey}`).should(
                    'be.visible'
                  );
                }
              }
            })
            .then(() => {
              mockUpdateDatabase(database.id, database.engine, {
                ...database,
                engine_config: {
                  ...(database.engine_config as ConfigCategoryValues),
                  [engineType]: {
                    ...(existingConfig as ConfigCategoryValues),
                    [config]: configValue,
                  },
                },
              }).as('updateAdvancedConfiguration');

              ui.button
                .findByTitle(saveButton)
                .scrollIntoView()
                .should('be.visible')
                .should('be.enabled')
                .click();
              cy.wait('@updateAdvancedConfiguration');
              cy.findByText(`${engineType}.${config}`).should('be.visible');
              cy.findByText(configValue).should('be.visible');
            });
        });

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

          let requiresRestart = false;
          const missingConfigs: Record<string, any> = {};
          const existingConfig =
            database.engine === 'mysql'
              ? database.engine_config.mysql
              : database.engine_config.pg;
          const mockConfigs: DatabaseEngineConfig =
            configuration.dbType === 'mysql'
              ? mysqlConfigResponse
              : postgresConfigResponse;
          const egnineType = database.engine === 'mysql' ? 'mysql' : 'pg';

          mockGetAccount(accountFactory.build()).as('getAccount');
          mockGetDatabase(database).as('getDatabase');
          mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
          mockGetDatabaseEngineConfigs(database.engine, mockConfigs);

          cy.visitWithLogin(
            `/databases/${database.engine}/${database.id}/configs`
          );
          cy.wait(['@getDatabase', '@getDatabaseTypes']);

          ui.button
            .findByTitle('Configure')
            .should('be.visible')
            .should('be.enabled')
            .click();
          ui.drawer
            .findByTitle('Advanced Configuration')
            .should('be.visible')
            .within(() => {
              for (const [flatKey, value] of Object.entries(
                mockConfigs[egnineType]
              )) {
                if (
                  !Object.keys(database.engine_config[egnineType]).includes(
                    flatKey
                  )
                ) {
                  missingConfigs[flatKey] =
                    value.minimum !== undefined
                      ? value.minimum
                      : value.type === 'boolean'
                        ? false
                        : value.example;

                  if (value.requires_restart !== false) {
                    requiresRestart = true;
                  }

                  cy.get(
                    '[data-qa-textfield-label="Add a Configuration Option"]'
                  )
                    // .scrollIntoView()
                    .should('be.visible');

                  cy.type(flatKey);

                  cy.contains(flatKey, { timeout: 5000 })
                    .should('be.visible')
                    .click();
                  ui.button.findByTitle('Add').click();

                  if (value.type !== 'boolean') {
                    cy.findByText(`${egnineType}.${flatKey}`)
                      // .scrollIntoView()
                      .should('be.visible');

                    cy.get(`[name="${flatKey}"]`)
                      .should('be.visible')
                      .type(missingConfigs[flatKey]);
                  }
                } else {
                  cy.log(`Config ${flatKey} already present.`);
                  cy.findByText(`${egnineType}.${flatKey}`).should(
                    'be.visible'
                  );
                }
              }
            })
            .then(() => {
              if (Object.keys(missingConfigs).length > 0) {
                const saveButton = requiresRestart
                  ? 'Save and Restart Service'
                  : 'Save';

                mockUpdateDatabase(database.id, database.engine, {
                  ...database,
                  engine_config: {
                    ...(database.engine_config as ConfigCategoryValues),
                    [egnineType]: {
                      ...(existingConfig as ConfigCategoryValues),
                      ...missingConfigs,
                    },
                  },
                }).as('updateAdvancedConfiguration');

                ui.button
                  .findByTitle(saveButton)
                  .scrollIntoView()
                  .should('be.visible')
                  .should('be.enabled')
                  .click();
                cy.wait('@updateAdvancedConfiguration');

                Object.entries(missingConfigs).forEach(([key, val]) => {
                  cy.findByText(`${egnineType}.${key}`).should('be.visible');
                });
              }
            });
        });
        // it('Negative validations for advanced configurations values in an active database clusters', () => {
        //   const initialLabel = configuration.label;
        //   const allowedIp = randomIp();
        //   const database = databaseFactory.extend({
        //       allow_list: [allowedIp],
        //       engine: configuration.dbType,
        //       id: randomNumber(1, 1000),
        //       label: initialLabel,
        //       cluster_size:configuration.clusterSize,
        //       platform: 'rdbms-default',
        //       region: configuration.region.id,
        //       status: 'active',
        //       type: configuration.linodeType,
        //       version: configuration.version,
        //       engine_config: getEngineConfig(configuration.dbType)
        //   }).build();

        //   const mockConfigs: DatabaseEngineConfig = configuration.dbType==='mysql' ? mysqlConfigResponse : postgresConfigResponse;
        //   const egnineType = database.engine === 'mysql' ? 'mysql' : 'pg';

        //   mockGetAccount(accountFactory.build()).as('getAccount');
        //   mockGetDatabase(database).as('getDatabase');
        //   mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
        //   mockGetDatabaseEngineConfigs(database.engine, mockConfigs)

        //   cy.visitWithLogin(`/databases/${database.engine}/${database.id}/configs`);
        //   cy.wait(['@getDatabase', '@getDatabaseTypes']);

        //   ui.button.findByTitle('Configure').should('be.visible').should('be.enabled').click();
        //   ui.drawer.findByTitle('Advanced Configuration').should('be.visible').within(() => {
        //     for(const [flatKey, value] of Object.entries(mockConfigs[egnineType])){
        //       if (!Object.keys(database.engine_config[egnineType]).includes(flatKey) && value.type=='integer' && value.minimum!=undefined && value.maximum!=undefined) {
        //         cy.get('[data-qa-textfield-label="Add a Configuration Option"]').scrollIntoView().should('be.visible').type(flatKey);
        //         cy.contains(flatKey).should('be.visible').click();
        //         ui.button.findByTitle('Add').click();
        //         cy.get('[data-qa-textfield-label="Add a Configuration Option"]').scrollIntoView().should('be.visible').type(flatKey);
        //         cy.contains(flatKey).should('be.visible').click();
        //         ui.button.findByTitle('Add').click();

        //         cy.findByText(`${egnineType}.${flatKey}`).scrollIntoView().should('be.visible');

        //         cy.get(`[name="${flatKey}"]`).should('be.visible').type(`${value.minimum - 1}`);
        //         cy.get('body').click(0, 0);
        //         cy.findByText(`${flatKey} must be at least ${value.minimum}`)

        //       }
        //     }

        //   })
        // })
      });
    }
  );
});
