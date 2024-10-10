import { renderHook, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';

import { AccountCapability } from '@linode/api-v4';
import { accountFactory } from 'src/factories';
import { TimeOption } from 'src/features/Databases/DatabaseDetail/DatabaseBackups/DatabaseBackups';
import {
  isDateOutsideBackup,
  isTimeOutsideBackup,
  toISOString,
  useIsDatabasesEnabled,
} from 'src/features/Databases/utilities';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

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

describe('useIsDatabasesEnabled', () => {
  it('should return false for an unrestricted user without the account capability', async () => {
    const { result } = setup([], { dbaasV2: { beta: true, enabled: true } });
    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(false);
      expect(result.current.isDatabasesV1Enabled).toBe(false);
      expect(result.current.isDatabasesV2Enabled).toBe(false);

      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isV2ExistingBetaUser).toBe(false);
      expect(result.current.isV2NewBetaUser).toBe(false);

      expect(result.current.isV2GAUser).toBe(false);
    });
  });

  it('should return true for an unrestricted user with the account capability V1', async () => {
    const { result } = setup(['Managed Databases'], {
      dbaasV2: { beta: false, enabled: false },
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV1Enabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(false);

      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isV2ExistingBetaUser).toBe(false);
      expect(result.current.isV2NewBetaUser).toBe(false);

      expect(result.current.isV2GAUser).toBe(false);
    });
  });

  it('should return true for a new unrestricted user with the account capability V2 and beta feature flag', async () => {
    const { result } = setup(['Managed Databases Beta'], {
      dbaasV2: { beta: true, enabled: true },
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV1Enabled).toBe(false);
      expect(result.current.isDatabasesV2Enabled).toBe(true);

      expect(result.current.isDatabasesV2Beta).toBe(true);
      expect(result.current.isV2ExistingBetaUser).toBe(false);
      expect(result.current.isV2NewBetaUser).toBe(true);

      expect(result.current.isV2GAUser).toBe(false);
    });
  });

  it('should return false for a new unrestricted user with the account capability V2 and no beta feature flag', async () => {
    const { result } = setup(['Managed Databases Beta'], {
      dbaasV2: { beta: true, enabled: false },
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(false);
      expect(result.current.isDatabasesV1Enabled).toBe(false);
      expect(result.current.isDatabasesV2Enabled).toBe(false);

      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isV2ExistingBetaUser).toBe(false);
      expect(result.current.isV2NewBetaUser).toBe(false);

      expect(result.current.isV2GAUser).toBe(false);
    });
  });

  it('should return true for an existing unrestricted user with the account capability V1 & V2 and beta feature flag', async () => {
    const { result } = setup(['Managed Databases', 'Managed Databases Beta'], {
      dbaasV2: { beta: true, enabled: true },
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV1Enabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(true);

      expect(result.current.isDatabasesV2Beta).toBe(true);
      expect(result.current.isV2ExistingBetaUser).toBe(true);
      expect(result.current.isV2NewBetaUser).toBe(false);

      expect(result.current.isV2GAUser).toBe(false);
    });
  });

  it('should return true for an existing unrestricted user with the account capability V1 and no beta feature flag', async () => {
    const { result } = setup(['Managed Databases'], {
      dbaasV2: { beta: false, enabled: true },
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV1Enabled).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(false);

      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isV2ExistingBetaUser).toBe(false);
      expect(result.current.isV2NewBetaUser).toBe(false);

      expect(result.current.isV2GAUser).toBe(true);
    });
  });

  it('should return true for a restricted user who can not load account but can load database engines', async () => {
    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json({}, { status: 403 });
      }),
      http.get('*/v4beta/databases/engines', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { result } = renderHook(() => useIsDatabasesEnabled(), {
      wrapper: wrapWithTheme,
    });

    await waitFor(() => expect(result.current.isDatabasesEnabled).toBe(true));
  });

  it('should return false for a restricted user who can not load account and database engines', async () => {
    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json({}, { status: 403 });
      }),
      http.get('*/v4beta/databases/engines', () => {
        return HttpResponse.json({}, { status: 404 });
      })
    );

    const { result } = renderHook(() => useIsDatabasesEnabled(), {
      wrapper: wrapWithTheme,
    });

    await waitFor(() => expect(result.current.isDatabasesEnabled).toBe(false));
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
    const oldestBackup = DateTime.fromISO('2024-10-02T09:00:00');
    const result = isTimeOutsideBackup(8, selectedDate, oldestBackup);
    expect(result).toEqual(true);
  });

  it('should return false when hour + selected date is equal to the oldest backup', () => {
    const selectedDate = DateTime.fromISO('2024-10-02');
    const oldestBackup = DateTime.fromISO('2024-10-02T09:00:00');
    const result = isTimeOutsideBackup(9, selectedDate, oldestBackup);
    expect(result).toEqual(false);
  });

  it('should return false when hour + selected date is after the oldest backup', () => {
    const selectedDate = DateTime.fromISO('2024-10-03');
    const oldestBackup = DateTime.fromISO('2024-10-02T09:00:00');
    const result = isTimeOutsideBackup(1, selectedDate, oldestBackup);
    expect(result).toEqual(false);
  });
});

describe('toISOString', () => {
  it('should convert a date and time to ISO string format', () => {
    const selectedDate = DateTime.fromObject({ year: 2023, month: 5, day: 15 });
    const selectedTime: TimeOption = { label: '02:00', value: 14 };
    const result = toISOString(selectedDate, selectedTime.value);
    expect(result).toContain('2023-05-15T14:00');
  });

  it('should handle midnight correctly', () => {
    const selectedDate = DateTime.fromObject({
      year: 2023,
      month: 12,
      day: 31,
    });
    const selectedTime: TimeOption = { label: '12:00 AM', value: 0 };
    const result = toISOString(selectedDate, selectedTime.value);
    expect(result).toContain('2023-12-31T00:00');
  });

  it('should handle noon correctly', () => {
    const selectedDate = DateTime.fromObject({ year: 2024, month: 1, day: 1 });
    const selectedTime: TimeOption = { label: '12:00 PM', value: 12 };
    const result = toISOString(selectedDate, selectedTime.value);
    expect(result).toContain('2024-01-01T12:00');
  });
});
