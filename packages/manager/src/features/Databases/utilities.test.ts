import { renderHook, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';

import { accountFactory } from 'src/factories';
import {
  isOutsideBackupTimeframe,
  useIsDatabasesEnabled,
} from 'src/features/Databases/utilities';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

describe('useIsDatabasesEnabled', () => {
  it('should return true for an unrestricted user with the account capability V1', async () => {
    const account = accountFactory.build({
      capabilities: ['Managed Databases'],
    });

    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { result } = renderHook(() => useIsDatabasesEnabled(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, {
          flags: { dbaasV2: { beta: false, enabled: false } },
        }),
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV1Enabled).toBe(true);
      expect(result.current.isDatabasesV2Beta).toBe(false);
      expect(result.current.isDatabasesV2Enabled).toBe(false);
    });
  });

  it('should return true for an unrestricted user with the account capability Beta', async () => {
    const account = accountFactory.build({
      capabilities: ['Managed Databases Beta'],
    });

    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { result } = renderHook(() => useIsDatabasesEnabled(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, {
          flags: { dbaasV2: { beta: true, enabled: true } },
        }),
    });

    await waitFor(() => {
      expect(result.current.isDatabasesEnabled).toBe(true);
      expect(result.current.isDatabasesV1Enabled).toBe(false);
      expect(result.current.isDatabasesV2Beta).toBe(true);
      expect(result.current.isDatabasesV2Enabled).toBe(true);
    });
  });

  it('should return false for an unrestricted user without the account capability', async () => {
    const account = accountFactory.build({
      capabilities: [],
    });

    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { result } = renderHook(() => useIsDatabasesEnabled(), {
      wrapper: wrapWithTheme,
    });

    await waitFor(() => expect(result.current.isDatabasesEnabled).toBe(false));
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

describe('isOutsideBackupTimeframe', () => {
  it('should return true if date is before the oldest backup', () => {
    const date = DateTime.now().minus({ days: 10 });
    const oldestBackup = DateTime.now().minus({ days: 5 });
    expect(isOutsideBackupTimeframe(date, oldestBackup)).toBe(true);
  });

  it('should return true if date is after today', () => {
    const date = DateTime.now().plus({ days: 1 });
    const oldestBackup = DateTime.now().minus({ days: 5 });
    expect(isOutsideBackupTimeframe(date, oldestBackup)).toBe(true);
  });

  it('should return false if date is between the oldest backup and today', () => {
    const date = DateTime.now().minus({ days: 3 });
    const oldestBackup = DateTime.now().minus({ days: 5 });
    expect(isOutsideBackupTimeframe(date, oldestBackup)).toBe(false);
  });

  it('should return true if there is no oldest backup', () => {
    const date = DateTime.now().minus({ days: 3 });
    expect(isOutsideBackupTimeframe(date, null)).toBe(true);
  });
});
