import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  databaseInstanceFactory,
  postgresConfigResponse,
  valkeyConfigResponse,
} from 'src/factories';
import {
  getShadowRootElement,
  renderWithThemeAndHookFormContext,
} from 'src/utilities/testHelpers';

import { DatabaseAdvancedConfigurationDrawer } from './DatabaseAdvancedConfigurationDrawer';
import { convertExistingConfigsToArray } from './utilities';

const queryMocks = vi.hoisted(() => ({
  useDatabaseEngineConfig: vi.fn().mockReturnValue({}),
  useDatabaseMutation: vi.fn().mockReturnValue({}),
}));

const props = {
  open: true,
  onClose: vi.fn(),
};

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useDatabaseEngineConfig: queryMocks.useDatabaseEngineConfig,
    useDatabaseMutation: queryMocks.useDatabaseMutation,
  };
});

describe('DatabaseAdvancedConfigurationDrawer', () => {
  beforeEach(() => {
    queryMocks.useDatabaseEngineConfig.mockReturnValue({
      data: postgresConfigResponse,
    });
  });

  it('should display label and description for a config', () => {
    const database = databaseInstanceFactory.build({
      engine: 'postgresql',
    });
    database.engine_config = {
      timezone: 'Europe/Helsinki',
    };

    renderWithThemeAndHookFormContext({
      component: (
        <DatabaseAdvancedConfigurationDrawer database={database} {...props} />
      ),
      useFormOptions: {
        defaultValues: {
          configs: convertExistingConfigsToArray(
            database.engine_config,
            postgresConfigResponse
          ),
        },
      },
    });

    const pglookoutLabel = screen.getByText('pg.timezone');
    const pglookoutDescription = screen.getByText(
      'PostgreSQL service timezone'
    );
    expect(pglookoutLabel).toBeVisible();
    expect(pglookoutDescription).toBeVisible();
  });

  it('should display a text input section for string, number, and integer configs', () => {
    const database = databaseInstanceFactory.build({
      engine: 'postgresql',
    });
    database.engine_config = {
      pglookout: {
        max_failover_replication_time_lag: 60, // integer config
        autovacuum_analyze_scale_factor: 0.2, // number config
      },
      timezone: 'Europe/Helsinki',
    };

    renderWithThemeAndHookFormContext({
      component: (
        <DatabaseAdvancedConfigurationDrawer database={database} {...props} />
      ),
      useFormOptions: {
        defaultValues: {
          configs: convertExistingConfigsToArray(
            database.engine_config,
            postgresConfigResponse
          ),
        },
      },
    });

    const textInputs = document.querySelectorAll<HTMLElement>('cds-text-field');
    expect(textInputs).toHaveLength(3);
  });

  it('should display a dropdown input for string enum configs', async () => {
    const database = databaseInstanceFactory.build({
      engine: 'postgresql',
    });
    database.engine_config = {
      pg: {
        default_toast_compression: 'lz4', // string enum config
      },
    };

    renderWithThemeAndHookFormContext({
      component: (
        <DatabaseAdvancedConfigurationDrawer database={database} {...props} />
      ),
      useFormOptions: {
        defaultValues: {
          configs: convertExistingConfigsToArray(
            database.engine_config,
            postgresConfigResponse
          ),
        },
      },
    });

    const toastCompressionDropdown = screen.getAllByRole('combobox')[1];
    await userEvent.click(toastCompressionDropdown);
    expect(screen.getByText('lz4')).toBeVisible();
    expect(screen.getByText('pglz')).toBeVisible();
  });

  it('should display a dropdown input for string/null enums and a text input for integer/null type configs', async () => {
    queryMocks.useDatabaseEngineConfig.mockReturnValue({
      data: valkeyConfigResponse,
    });
    const database = databaseInstanceFactory.build({
      engine: 'valkey',
    });
    database.engine_config = {
      valkey_maxmemory_policy: 'noeviction', // string/null enum config
      backup_hour: 3, // integer/null config
    };

    renderWithThemeAndHookFormContext({
      component: (
        <DatabaseAdvancedConfigurationDrawer database={database} {...props} />
      ),
      useFormOptions: {
        defaultValues: {
          configs: convertExistingConfigsToArray(
            database.engine_config,
            valkeyConfigResponse
          ),
        },
      },
    });

    const backupHost = document.querySelector('cds-text-field');
    const backupTextInput = await getShadowRootElement<HTMLInputElement>(
      backupHost!,
      'input'
    );
    expect(backupTextInput).toBeTruthy();

    const maxMemoryDropdown = screen.getAllByRole('combobox')[1];
    await userEvent.click(maxMemoryDropdown);
    expect(screen.getByText('noeviction')).toBeVisible();
    expect(screen.getByText('allkeys-lru')).toBeVisible();
    expect(screen.getByText('volatile-lru')).toBeVisible();
  });

  it('should display a switch button for boolean configs', async () => {
    const database = databaseInstanceFactory.build({
      engine: 'postgresql',
    });
    database.engine_config = {
      pg_stat_monitor_enable: false,
    };

    renderWithThemeAndHookFormContext({
      component: (
        <DatabaseAdvancedConfigurationDrawer database={database} {...props} />
      ),
      useFormOptions: {
        defaultValues: {
          configs: convertExistingConfigsToArray(
            database.engine_config,
            postgresConfigResponse
          ),
        },
      },
    });

    const switchHost = document.querySelector('cds-switch');
    expect(switchHost).not.toBeNull();
    const switchControl = await getShadowRootElement<HTMLButtonElement>(
      switchHost as HTMLElement,
      'button[role="switch"]'
    );
    expect(switchControl).not.toBeNull();
  });

  it('should disable the save button until an option is updated', async () => {
    const database = databaseInstanceFactory.build({
      engine: 'postgresql',
    });
    database.engine_config = { synchronous_replication: 'off' };

    renderWithThemeAndHookFormContext({
      component: (
        <DatabaseAdvancedConfigurationDrawer database={database} {...props} />
      ),
      useFormOptions: {
        defaultValues: {
          configs: convertExistingConfigsToArray(
            database.engine_config,
            postgresConfigResponse
          ),
        },
      },
    });

    const saveBtn = screen.getByText('Save');
    const actualSaveButton = await getShadowRootElement(saveBtn, 'button');
    expect(actualSaveButton).toBeDisabled();
    expect(actualSaveButton).toBeVisible();

    const input = screen.getAllByRole('combobox')[1];
    expect(input).toHaveAttribute('value', 'off');

    await userEvent.click(input);
    const option = await screen.findByText('quorum');
    await userEvent.click(option);
    expect(input).toHaveAttribute('value', 'quorum');
    expect(actualSaveButton).toBeEnabled();
  });

  it('should display a badge if the option requires a restart and update the save button if the option is updated', async () => {
    const database = databaseInstanceFactory.build({
      engine: 'postgresql',
    });
    database.engine_config = { pg_stat_monitor_enable: true };

    renderWithThemeAndHookFormContext({
      component: (
        <DatabaseAdvancedConfigurationDrawer database={database} {...props} />
      ),
      useFormOptions: {
        defaultValues: {
          configs: convertExistingConfigsToArray(
            database.engine_config,
            postgresConfigResponse
          ),
        },
      },
    });

    const restartBadge = screen.getByText('RESTARTS SERVICE');
    expect(restartBadge).toBeVisible();

    // eslint-disable-next-line testing-library/no-node-access -- cds-switch Web Component host for shadow root
    const switchHost = document.querySelector('cds-switch');
    expect(switchHost).not.toBeNull();
    const switchControl = await getShadowRootElement<HTMLButtonElement>(
      switchHost as HTMLElement,
      'button[role="switch"]'
    );
    expect(switchControl).not.toBeNull();
    expect(switchControl).not.toBeDisabled();
    expect(switchControl).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(switchControl!);
    expect(switchControl).toHaveAttribute('aria-checked', 'false');

    const saveAndRestartBtn = screen.getByText('Save and Restart Service');
    const actualSaveAndRestartButton = await getShadowRootElement(
      saveAndRestartBtn,
      'button'
    );
    expect(actualSaveAndRestartButton).toBeDefined();
    expect(actualSaveAndRestartButton).not.toBeNull();
    expect(actualSaveAndRestartButton).toBeEnabled();
    expect(actualSaveAndRestartButton).toBeVisible();
  });

  it('should display inline form errors', async () => {
    const database = databaseInstanceFactory.build({
      engine: 'postgresql',
    });
    database.cluster_size = 1;
    database.engine_config = { synchronous_replication: 'off' };

    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    renderWithThemeAndHookFormContext({
      component: (
        <DatabaseAdvancedConfigurationDrawer database={database} {...props} />
      ),
      useFormOptions: {
        defaultValues: {
          configs: convertExistingConfigsToArray(
            database.engine_config,
            postgresConfigResponse
          ),
        },
      },
    });

    queryMocks.useDatabaseMutation.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue([
        {
          field: 'engine_config.synchronous_replication',
          reason:
            'synchronous_replication is only supported for clusters with 3 nodes',
        },
      ]),
    });

    const saveBtn = screen.getByText('Save');
    const actualSaveButton = await getShadowRootElement(saveBtn, 'button');

    expect(actualSaveButton).toBeDefined();
    expect(actualSaveButton).not.toBeNull();

    expect(actualSaveButton).toBeDisabled();
    expect(actualSaveButton).toBeVisible();

    const input = screen.getAllByRole('combobox')[1];
    await userEvent.click(input);
    await userEvent.click(input); // must click twice in unit test to open the options list when rendered in a portal. Not completely sure why.

    const option = await screen.findByText('quorum');
    await userEvent.click(option);
    expect(input).toHaveAttribute('value', 'quorum');
    await userEvent.click(actualSaveButton!);

    const error = screen.getByText(
      'synchronous_replication is only supported for clusters with 3 nodes'
    );
    expect(error).toBeVisible();
  });
});
