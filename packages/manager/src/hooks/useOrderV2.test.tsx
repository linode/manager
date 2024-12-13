import { act, renderHook, waitFor } from '@testing-library/react';

import { HttpResponse, http, server } from 'src/mocks/testServer';
import { queryClientFactory } from 'src/queries/base';
import { wrapWithThemeAndRouter } from 'src/utilities/testHelpers';

import { useOrderV2 } from './useOrderV2';

import type { UseOrderV2Props } from './useOrderV2';

const mockNavigate = vi.fn();
const mockUseSearch = vi.fn(() => ({}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
    useSearch: vi.fn(() => mockUseSearch()),
  };
});

const queryClient = queryClientFactory();
const defaultProps: UseOrderV2Props = {
  initialRoute: {
    defaultOrder: {
      order: 'asc',
      orderBy: 'label',
    },
    from: '/',
  },
  preferenceKey: 'volumes',
};

describe('useOrderV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should use URL params with prefix', async () => {
    mockUseSearch.mockReturnValue({
      'test-order': 'desc',
      'test-orderBy': 'status',
    });

    const { result } = renderHook(
      () => useOrderV2({ ...defaultProps, prefix: 'test' }),
      {
        wrapper: (ui) => wrapWithThemeAndRouter(ui.children, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.order).toBe('desc');
      expect(result.current.orderBy).toBe('status');
    });
  });

  it('should use preferences when present and no URL params are provided', async () => {
    mockUseSearch.mockReturnValue({});

    server.use(
      http.get('*/profile/preferences', () => {
        return HttpResponse.json({
          sortKeys: {
            volumes: {
              order: 'desc',
              orderBy: 'size',
            },
          },
        });
      })
    );

    const { result } = renderHook(() => useOrderV2(defaultProps), {
      wrapper: (ui) => wrapWithThemeAndRouter(ui.children, { queryClient }),
    });

    await waitFor(() => {
      expect(result.current.order).toBe('desc');
      expect(result.current.orderBy).toBe('size');
    });
  });

  it('should use default values as last priority', async () => {
    mockUseSearch.mockReturnValue({});

    server.use(
      http.get('*/profile/preferences', () => {
        return HttpResponse.json({ sortKeys: {} });
      })
    );

    const { result } = renderHook(() => useOrderV2(defaultProps), {
      wrapper: (ui) => wrapWithThemeAndRouter(ui.children, { queryClient }),
    });

    await waitFor(() => {
      expect(result.current.order).toBe(
        defaultProps.initialRoute.defaultOrder.order
      );
      expect(result.current.orderBy).toBe(
        defaultProps.initialRoute.defaultOrder.orderBy
      );
    });
  });

  it('should update URL and preferences when handleOrderChange is called', async () => {
    const mutatePreferencesMock = vi.fn();
    server.use(
      http.put('*/profile/preferences', async ({ request }) => {
        const body = await request.json();
        mutatePreferencesMock(body);
        return HttpResponse.json(body);
      })
    );

    mockUseSearch.mockReturnValue({});

    const { result } = renderHook(() => useOrderV2(defaultProps), {
      wrapper: (ui) => wrapWithThemeAndRouter(ui.children, { queryClient }),
    });

    act(() => {
      result.current.handleOrderChange('size', 'desc');
    });

    mockUseSearch.mockReturnValue({
      order: 'desc',
      orderBy: 'size',
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
          to: '/',
        })
      );
      expect(mutatePreferencesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          sortKeys: expect.objectContaining({
            volumes: {
              order: 'desc',
              orderBy: 'size',
            },
          }),
        })
      );
      expect(result.current.order).toBe('desc');
      expect(result.current.orderBy).toBe('size');
    });
  });
});
