import { renderHook, waitFor } from '@testing-library/react';

import { HttpResponse, http, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useSecureVMNoticesEnabled } from './useSecureVMNoticesEnabled';

import type { Flags } from 'src/featureFlags';

describe('useSecureVMNoticesEnabled', () => {
  it('returns true when the header is included', async () => {
    server.use(
      http.get('*/profile', () => {
        return new HttpResponse(null, {
          headers: { 'Akamai-Internal-Account': '*' },
        });
      })
    );

    const { result } = renderHook(() => useSecureVMNoticesEnabled(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, {
          flags: {
            secureVmCopy: { bannerLabel: 'Test' } as Flags['secureVmCopy'],
          },
        }),
    });

    await waitFor(() => {
      expect(result.current.secureVMNoticesEnabled).toBe(true);
    });
  });

  it('returns true when the preference is set to always', async () => {
    server.use(
      http.get('*/profile/preferences', () => {
        return HttpResponse.json({
          secure_vm_notices: 'always',
        });
      })
    );

    const { result } = renderHook(() => useSecureVMNoticesEnabled(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, {
          flags: {
            secureVmCopy: { bannerLabel: 'Test' } as Flags['secureVmCopy'],
          },
        }),
    });

    await waitFor(() => {
      expect(result.current.secureVMNoticesEnabled).toBe(true);
    });
  });

  it('returns false when the feature flag is turned off', async () => {
    server.use(
      http.get('*/profile/preferences', () => {
        return HttpResponse.json({
          secure_vm_notices: 'always',
        });
      })
    );

    const { result } = renderHook(() => useSecureVMNoticesEnabled(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, {
          flags: { secureVmCopy: {} as Flags['secureVmCopy'] },
        }),
    });

    await waitFor(() => {
      expect(result.current.secureVMNoticesEnabled).toBe(false);
    });
  });

  it('returns false otherwise', async () => {
    const { result } = renderHook(() => useSecureVMNoticesEnabled(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, {
          flags: { secureVmCopy: {} as Flags['secureVmCopy'] },
        }),
    });

    await waitFor(() => {
      expect(result.current.secureVMNoticesEnabled).toBe(false);
    });
  });
});
