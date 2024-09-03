import { renderHook, waitFor } from '@testing-library/react';

import { accountFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useIsDatabasesEnabled } from './utilities';

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
      expect(result.current.isDatabasesV2Enabled).toBe(false);
    });
  });

  it('should return true for an unrestricted user with the account capability V2', async () => {
    const account = accountFactory.build({
      capabilities: ['Managed Databases V2'],
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
