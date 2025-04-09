import { renderHook, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';

import {
  accountFactory,
  databaseFactory,
  databaseTypeFactory,
} from 'src/factories';
import {
  formatConfigValue,
  getDatabasesDescription,
  hasPendingUpdates,
  isDateOutsideBackup,
  isDefaultDatabase,
  isLegacyDatabase,
  isTimeOutsideBackup,
  toFormatedDate,
  toISOString,
  upgradableVersions,
  useIsDatabasesEnabled,
} from 'src/features/Databases/utilities';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import type {
  AccountCapability,
  Database,
  Engine,
  PendingUpdates,
} from '@linode/api-v4';
import type { TimeOption } from 'src/features/Databases/DatabaseDetail/DatabaseBackups/DatabaseBackups';

const setup = (capabilities: AccountCapability[], flags: any) => {
  const account = accountFactory.build({ capabilities });

  server.use(
    http.get('*/v4/account', () => {
      return HttpResponse.json(account);
    })
  );

  return renderHook(() => useIsDatabasesEnabled(), {
    wrapper: (ui) => wrapWithTheme(ui, { flags }),
  });
};

const queryMocks = vi.hoisted(() => ({
  useDatabaseTypesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/databases/databases', () => ({
  useDatabaseTypesQuery: queryMocks.useDatabaseTypesQuery,
}));

describe('useIsDatabasesEnabled', () => {
  it('should return correctly for non V1/V2 user', async () => {
    const { result } = setup([], { dbaasV2: { beta: true, enabled: true } });
    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(false);
      expect(result.current.isDatabasesV2Enabled).toBe(false);

      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isUserExistingBeta).toBe(false);
      expect(result.current.isUserNewBeta).toBe(false);

      expect(result.current.isDatabasesV2GA).toBe(false);
    });
  });

  it('should return correctly for V1 user', async () => {
    const { result } = setup(['Managed Databases'], {
      dbaasV2: { beta: false, enabled: false },
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(false);

      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isUserExistingBeta).toBe(false);
      expect(result.current.isUserNewBeta).toBe(false);

      expect(result.current.isDatabasesV2GA).toBe(false);
    });
  });

  it('should return correctly for V2 new user beta', async () => {
    const { result } = setup(['Managed Databases Beta'], {
      dbaasV2: { beta: true, enabled: true },
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(true);

      expect(result.current.isDatabasesV2Beta).toBe(true);
      expect(result.current.isUserExistingBeta).toBe(false);
      expect(result.current.isUserNewBeta).toBe(true);

      expect(result.current.isDatabasesV2GA).toBe(false);
    });
  });

  it('should return correctly for V2 new user no beta', async () => {
    const { result } = setup(['Managed Databases Beta'], {
      dbaasV2: { beta: false, enabled: false },
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(false);
      expect(result.current.isDatabasesV2Enabled).toBe(false);

      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isUserExistingBeta).toBe(false);
      expect(result.current.isUserNewBeta).toBe(false);

      expect(result.current.isDatabasesV2GA).toBe(false);
    });
  });

  it('should return correctly for V1 & V2 existing user beta', async () => {
    const { result } = setup(['Managed Databases', 'Managed Databases Beta'], {
      dbaasV2: { beta: true, enabled: true },
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(true);

      expect(result.current.isDatabasesV2Beta).toBe(true);
      expect(result.current.isUserExistingBeta).toBe(true);
      expect(result.current.isUserNewBeta).toBe(false);

      expect(result.current.isDatabasesV2GA).toBe(false);
    });
  });

  it('should return correctly for V1 existing user GA', async () => {
    const { result } = setup(['Managed Databases'], {
      dbaasV2: { beta: false, enabled: true },
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(true);

      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isUserExistingBeta).toBe(false);
      expect(result.current.isUserNewBeta).toBe(false);

      expect(result.current.isDatabasesV2GA).toBe(true);
    });
  });

  it('should return correctly for V1 restricted user non-beta', async () => {
    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json({}, { status: 403 });
      })
    );

    // default
    queryMocks.useDatabaseTypesQuery.mockReturnValueOnce({
      data: null,
    });

    // legacy
    queryMocks.useDatabaseTypesQuery.mockReturnValueOnce({
      data: databaseTypeFactory.buildList(1),
    });

    const flags = { dbaasV2: { beta: true, enabled: true } };

    const { result } = renderHook(() => useIsDatabasesEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenNthCalledWith(
      1,
      ...[{ platform: 'rdbms-default' }, true]
    );

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenNthCalledWith(
      2,
      ...[{ platform: 'rdbms-legacy' }, true]
    );

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(false);

      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isUserExistingBeta).toBe(false);
      expect(result.current.isUserNewBeta).toBe(false);

      expect(result.current.isDatabasesV2GA).toBe(false);
    });
  });

  it('should return correctly for V1 & V2 restricted user existing beta', async () => {
    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json({}, { status: 403 });
      })
    );

    // default
    queryMocks.useDatabaseTypesQuery.mockReturnValueOnce({
      data: databaseTypeFactory.buildList(1),
    });

    // legacy
    queryMocks.useDatabaseTypesQuery.mockReturnValueOnce({
      data: databaseTypeFactory.buildList(1),
    });

    const flags = { dbaasV2: { beta: true, enabled: true } };

    const { result } = renderHook(() => useIsDatabasesEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenNthCalledWith(
      1,
      ...[{ platform: 'rdbms-default' }, true]
    );

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenNthCalledWith(
      2,
      ...[{ platform: 'rdbms-legacy' }, true]
    );

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(true);

      expect(result.current.isDatabasesV2Beta).toBe(true);
      expect(result.current.isUserExistingBeta).toBe(true);
      expect(result.current.isUserNewBeta).toBe(false);

      expect(result.current.isDatabasesV2GA).toBe(false);
    });
  });

  it('should return correctly for V2 restricted user new beta', async () => {
    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json({}, { status: 403 });
      })
    );

    // default
    queryMocks.useDatabaseTypesQuery.mockReturnValueOnce({
      data: databaseTypeFactory.buildList(1),
    });

    // legacy
    queryMocks.useDatabaseTypesQuery.mockReturnValueOnce({
      data: null,
    });

    const flags = { dbaasV2: { beta: true, enabled: true } };

    const { result } = renderHook(() => useIsDatabasesEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenNthCalledWith(
      1,
      ...[{ platform: 'rdbms-default' }, true]
    );

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenNthCalledWith(
      2,
      ...[{ platform: 'rdbms-legacy' }, true]
    );

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(true);

      expect(result.current.isDatabasesV2Beta).toBe(true);
      expect(result.current.isUserExistingBeta).toBe(false);
      expect(result.current.isUserNewBeta).toBe(true);

      expect(result.current.isDatabasesV2GA).toBe(false);
    });
  });

  it('should return correctly for V2 restricted user GA', async () => {
    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json({}, { status: 403 });
      })
    );

    // default
    queryMocks.useDatabaseTypesQuery.mockReturnValueOnce({
      data: databaseTypeFactory.buildList(1),
    });

    // legacy
    queryMocks.useDatabaseTypesQuery.mockReturnValueOnce({
      data: null,
    });

    const flags = { dbaasV2: { beta: false, enabled: true } };

    const { result } = renderHook(() => useIsDatabasesEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, { flags }),
    });

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenNthCalledWith(
      1,
      ...[{ platform: 'rdbms-default' }, true]
    );

    expect(queryMocks.useDatabaseTypesQuery).toHaveBeenNthCalledWith(
      2,
      ...[{ platform: 'rdbms-legacy' }, true]
    );

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(true);

      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isUserExistingBeta).toBe(false);
      expect(result.current.isUserNewBeta).toBe(false);

      expect(result.current.isDatabasesV2GA).toBe(true);
    });
  });
});

describe('isDateOutsideBackup', () => {
  it('should return true if date is before the oldest backup', () => {
    const date = DateTime.now().minus({ days: 10 });
    const oldestBackup = DateTime.now().minus({ days: 5 });
    expect(isDateOutsideBackup(date, oldestBackup)).toBe(true);
  });

  it('should return true if date is after today', () => {
    const date = DateTime.now().plus({ days: 1 });
    const oldestBackup = DateTime.now().minus({ days: 5 });
    expect(isDateOutsideBackup(date, oldestBackup)).toBe(true);
  });

  it('should return false if date is between the oldest backup and today', () => {
    const date = DateTime.now().minus({ days: 3 });
    const oldestBackup = DateTime.now().minus({ days: 5 });
    expect(isDateOutsideBackup(date, oldestBackup)).toBe(false);
  });

  it('should return true if there is no oldest backup', () => {
    const date = DateTime.now().minus({ days: 3 });
    expect(isDateOutsideBackup(date, null)).toBe(true);
  });
});

describe('isTimeOutsideBackup', () => {
  it('should return true when hour + selected date is before oldest backup', () => {
    const selectedDate = DateTime.fromISO('2024-10-02');
    const oldestBackup = DateTime.fromISO('2024-10-02T09:00:00Z');
    const result = isTimeOutsideBackup(8, selectedDate, oldestBackup);
    expect(result).toEqual(true);
  });

  it('should return false when hour + selected date is equal to the oldest backup', () => {
    const selectedDate = DateTime.fromISO('2024-10-02');
    const oldestBackup = DateTime.fromISO('2024-10-02T09:00:00Z');
    const result = isTimeOutsideBackup(9, selectedDate, oldestBackup);
    expect(result).toEqual(false);
  });

  it('should return false when hour + selected date is after the oldest backup', () => {
    const selectedDate = DateTime.fromISO('2024-10-03');
    const oldestBackup = DateTime.fromISO('2024-10-02T09:00:00Z');
    const result = isTimeOutsideBackup(1, selectedDate, oldestBackup);
    expect(result).toEqual(false);
  });
});

describe('toFormatedDate', () => {
  it('should convert a date and time to the format YYYY-MM-DD HH:mm for the dialog', () => {
    const selectedDate = DateTime.fromObject({ day: 15, month: 1, year: 2025 });
    const selectedTime: TimeOption = { label: '14:00', value: 14 };
    const result = toFormatedDate(selectedDate, selectedTime.value);
    expect(result).toContain('2025-01-15 14:00');
  });
  it('should handle newest full backup plus incremental option correctly in UTC', () => {
    const selectedDate = null;
    const today = DateTime.utc();
    const mockTodayWithHours = DateTime.fromObject({
      day: today.day,
      month: today.month,
      year: today.year,
      hour: today.hour,
      minute: 0,
    }).toFormat('yyyy-MM-dd HH:mm');
    const result = toFormatedDate(selectedDate, undefined);
    expect(result).toContain(mockTodayWithHours);
  });
});

describe('toISOString', () => {
  it('should convert a date and time to ISO string format', () => {
    const selectedDate = DateTime.fromObject({ day: 15, month: 5, year: 2023 });
    const selectedTime: TimeOption = { label: '14:00', value: 14 };
    const result = toISOString(selectedDate, selectedTime.value);
    expect(result).toContain('2023-05-15T14:00');
  });

  it('should handle midnight correctly', () => {
    const selectedDate = DateTime.fromObject({
      day: 31,
      month: 12,
      year: 2023,
    });
    const selectedTime: TimeOption = { label: '12:00 AM', value: 0 };
    const result = toISOString(selectedDate, selectedTime.value);
    expect(result).toContain('2023-12-31T00:00');
  });

  it('should handle noon correctly', () => {
    const selectedDate = DateTime.fromObject({ day: 1, month: 1, year: 2024 });
    const selectedTime: TimeOption = { label: '12:00 PM', value: 12 };
    const result = toISOString(selectedDate, selectedTime.value);
    expect(result).toContain('2024-01-01T12:00');
  });
});

describe('getDatabasesDescription', () => {
  it('should return MySQL', () => {
    const result = getDatabasesDescription({
      engine: 'mysql',
      version: '8.0.30',
    });
    expect(result).toEqual('MySQL v8.0.30');
  });

  it('should return PostgreSQL', () => {
    const db: Database = databaseFactory.build({
      engine: 'postgresql',
      version: '14.13',
    });
    const result = getDatabasesDescription(db);
    expect(result).toEqual('PostgreSQL v14.13');
  });
});

describe('hasPendingUpdates', () => {
  it('should return false when there are no pending updates provided', () => {
    expect(hasPendingUpdates()).toBe(false);
  });

  it('should return false when pendingUpdates param is undefined', () => {
    expect(hasPendingUpdates(undefined)).toBe(false);
  });

  it('should return false when pending updates is an empty array', () => {
    const updates: PendingUpdates[] = [];
    expect(hasPendingUpdates(updates)).toBe(false);
  });

  it('should return true when there are pending updates', () => {
    const updates: PendingUpdates[] = [
      {
        deadline: null,
        description: 'Log configuration options changes required',
        planned_for: null,
      },
    ];
    expect(hasPendingUpdates(updates)).toBe(true);
  });
});

describe('isDefaultDatabase', () => {
  it('should return true for default platform database', () => {
    const db: Database = databaseFactory.build({
      platform: 'rdbms-default',
    });
    const result = isDefaultDatabase(db);
    expect(result).toBe(true);
  });

  it('should return false for legacy platform database', () => {
    const db: Database = databaseFactory.build({
      platform: 'rdbms-legacy',
    });
    const result = isDefaultDatabase(db);
    expect(result).toBe(false);
    expect(isDefaultDatabase({ platform: undefined })).toBe(false);
  });
});

describe('isLegacyDatabase', () => {
  it('should return true for legacy databases', () => {
    expect(isLegacyDatabase({ platform: 'rdbms-legacy' })).toBe(true);
  });

  it('should return true fro undefined platform', () => {
    expect(isLegacyDatabase({ platform: undefined })).toBe(true);
  });

  it('should return false for non-legacy databases', () => {
    expect(isLegacyDatabase({ platform: 'rdbms-default' })).toBe(false);
  });
});

describe('upgradableVersions', () => {
  const mockEngines = [
    {
      engine: 'mysql' as Engine,
      id: 'mysql/8',
      version: '8',
    },
    {
      engine: 'postgresql' as Engine,
      id: 'postgresql/13',
      version: '13',
    },
    {
      engine: 'postgresql' as Engine,
      id: 'postgresql/14',
      version: '14',
    },
    {
      engine: 'postgresql' as Engine,
      id: 'postgresql/15',
      version: '15',
    },
    {
      engine: 'postgresql' as Engine,
      id: 'postgresql/16',
      version: '16',
    },
  ];

  it('should return engines with higher versions for the same engine type', () => {
    const result = upgradableVersions('postgresql', '14.0.26', mockEngines);
    expect(result).toHaveLength(2);
    expect(result![0].version).toBe('15');
  });

  it('should return empty array when no upgrades are available', () => {
    const result = upgradableVersions('mysql', '8.0.30', mockEngines);
    expect(result).toHaveLength(0);
  });

  it('should only return engines of the same type', () => {
    const result = upgradableVersions('postgresql', '14.13.0', mockEngines);
    expect(result?.every((engine) => engine.engine === 'postgresql')).toBe(
      true
    );
  });

  it('should return undefined when no engines are provided', () => {
    const result = upgradableVersions('mysql', '8.0.26', undefined);
    expect(result).toBeUndefined();
  });
});

describe('formatConfigValue', () => {
  it('should return "Enabled" when configValue is "true"', () => {
    const result = formatConfigValue('true');
    expect(result).toBe('Enabled');
  });

  it('should return "Disabled" when configValue is "false"', () => {
    const result = formatConfigValue('false');
    expect(result).toBe('Disabled');
  });

  it('should return " -" when configValue is "undefined"', () => {
    const result = formatConfigValue('undefined');
    expect(result).toBe(' - ');
  });

  it('should return the original configValue for other values', () => {
    const result = formatConfigValue('+03:00');
    expect(result).toBe('+03:00');
  });
});
