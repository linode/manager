import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { databaseInstanceFactory, postgresConfigResponse } from 'src/factories';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

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

queryMocks.useDatabaseEngineConfig.mockReturnValue({
  data: postgresConfigResponse,
});

describe('DatabaseAdvancedConfigurationDrawer', () => {
  it('should display an input section and description for each existing config', () => {
    const database = databaseInstanceFactory.build({
      engine: 'postgresql',
    });
    database.engine_config = {
      pglookout: {
        max_failover_replication_time_lag: 60,
      },
      synchronous_replication: 'off',
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

    const pglookoutLabel = screen.getByText(
      'pglookout.max_failover_replication_time_lag'
    );
    const pglookoutDescription = screen.getByText(
      'Number of seconds of master unavailability before triggering database failover to standby'
    );
    const synchronousReplicationLabel = screen.getByText(
      'synchronous_replication'
    );
    const synchronousReplicationDescription = screen.getByText(
      'Synchronous replication type. Note that the service plan also needs to support synchronous replication.'
    );
    expect(pglookoutLabel).toBeVisible();
    expect(pglookoutDescription).toBeVisible();
    expect(synchronousReplicationLabel).toBeVisible();
    expect(synchronousReplicationDescription).toBeVisible();
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

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    expect(saveBtn).toBeDisabled();
    expect(saveBtn).toBeVisible();

    const input = screen.getAllByRole('combobox')[1];
    expect(input).toHaveAttribute('value', 'off');

    await userEvent.click(input);
    const option = await screen.findByText('quorum');
    await userEvent.click(option);
    expect(input).toHaveAttribute('value', 'quorum');
    expect(saveBtn).toBeEnabled();
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

    const restartBadge = screen.getByText('restarts service');
    expect(restartBadge).toBeVisible();

    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeEnabled();
    expect(toggle).toBeChecked();

    await userEvent.click(toggle);
    expect(toggle).not.toBeChecked();

    const saveAndRestartBtn = screen.getByRole('button', {
      name: 'Save and Restart Service',
    });
    expect(saveAndRestartBtn).toBeEnabled();
    expect(saveAndRestartBtn).toBeVisible();
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

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    expect(saveBtn).toBeDisabled();
    expect(saveBtn).toBeVisible();

    const input = screen.getAllByRole('combobox')[1];
    await userEvent.click(input);

    const option = await screen.findByText('quorum');
    await userEvent.click(option);
    expect(input).toHaveAttribute('value', 'quorum');
    await userEvent.click(saveBtn);

    const error = screen.getByText(
      'synchronous_replication is only supported for clusters with 3 nodes'
    );
    expect(error).toBeVisible();
  });
});
