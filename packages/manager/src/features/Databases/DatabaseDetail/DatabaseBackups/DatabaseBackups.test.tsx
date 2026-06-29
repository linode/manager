import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { databaseFactory } from 'src/factories';
import {
  getShadowRootElement,
  renderWithTheme,
} from 'src/utilities/testHelpers';

import { DatabaseDetailContext } from '../DatabaseDetailContext';
import { DatabaseBackups } from './DatabaseBackups';

const backupsTestRoute = '/databases/mysql/1234567890/backups';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn(),
}));

const queriesMocks = vi.hoisted(() => ({
  useDatabaseQuery: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useDatabaseQuery: queriesMocks.useDatabaseQuery,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('Database Backups (v2)', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      engine: 'mysql',
      databaseId: '1234567890',
    });
    queriesMocks.useDatabaseQuery.mockReset();
  });

  it('should disable the restore button if the engine is postgres/mysql and no oldest_restore_time is returned', async () => {
    const mockDatabase = databaseFactory.build({
      id: 1234567890,
      oldest_restore_time: null,
      platform: 'rdbms-default',
    });

    queriesMocks.useDatabaseQuery.mockReturnValue({
      data: mockDatabase,
      error: null,
      isLoading: false,
    });

    const { container } = renderWithTheme(<DatabaseBackups />, {
      initialRoute: backupsTestRoute,
    });

    await waitFor(() => {
      expect(
        container.querySelector('[data-qa-settings-button="restore"]')
      ).toBeTruthy();
    });

    // eslint-disable-next-line testing-library/no-node-access -- cds-button host for shadow root
    const restoreHost = container.querySelector<HTMLElement>(
      '[data-qa-settings-button="restore"]'
    )!;

    const restoreButton = await getShadowRootElement(restoreHost, 'button');
    expect(restoreButton).toBeDisabled();
  });

  it('should render a date picker when it is a default database', async () => {
    const mockDatabase = databaseFactory.build({
      id: 1234567890,
      platform: 'rdbms-default',
    });

    queriesMocks.useDatabaseQuery.mockReturnValue({
      data: mockDatabase,
      error: null,
      isLoading: false,
    });

    const { container } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database: mockDatabase, engine: 'mysql' }}
      >
        <DatabaseBackups />
      </DatabaseDetailContext.Provider>,
      { initialRoute: backupsTestRoute }
    );

    await waitFor(() => {
      expect(container.querySelector('cds-calendar')).toBeInTheDocument();
    });
  });

  it('should render a time picker when it is a default database', async () => {
    const mockDatabase = databaseFactory.build({
      id: 1234567890,
      platform: 'rdbms-default',
    });

    queriesMocks.useDatabaseQuery.mockReturnValue({
      data: mockDatabase,
      error: null,
      isLoading: false,
    });

    const { findByText } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database: mockDatabase, engine: 'mysql' }}
      >
        <DatabaseBackups />
      </DatabaseDetailContext.Provider>,
      {
        initialRoute: backupsTestRoute,
      }
    );

    const timePickerLabel = await findByText('Time (UTC)');
    expect(timePickerLabel).toBeInTheDocument();
  });

  it('should render a restore time dropdown if the engine is valkey', async () => {
    const mockDatabase = databaseFactory.build({
      id: 1234567890,
      platform: 'rdbms-default',
      engine: 'valkey',
      oldest_restore_time: null,
      available_restore_times: [
        '2025-12-28T20:34:59',
        '2025-12-29T08:35:29',
        '2025-12-30T15:35:29',
      ],
    });

    queriesMocks.useDatabaseQuery.mockReturnValue({
      data: mockDatabase,
      error: null,
      isLoading: false,
    });

    const { container } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database: mockDatabase, engine: 'valkey' }}
      >
        <DatabaseBackups />
      </DatabaseDetailContext.Provider>,
      {
        initialRoute: backupsTestRoute,
      }
    );

    const cdsSelect = container.querySelector('cds-select');
    expect(cdsSelect).not.toBeNull();

    const inputSelect = await getShadowRootElement<HTMLInputElement>(
      cdsSelect as HTMLElement,
      'input[role="combobox"]'
    );
    expect(inputSelect).not.toBeNull();

    await userEvent.click(inputSelect!);
    await waitFor(() => {
      expect(inputSelect).toHaveAttribute('aria-expanded', 'true');
    });

    const options = Array.from(
      cdsSelect!.shadowRoot?.querySelectorAll<HTMLElement>(
        'li[role="option"]'
      ) ?? []
    );
    expect(options).toHaveLength(3);
  });
});
