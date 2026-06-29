import { queryClientFactory } from '@linode/queries';
import { act, renderHook, waitFor } from '@testing-library/react';

import { http, HttpResponse, server } from 'src/mocks/testServer';

import { wrapWithProviders } from '../utilities/testHelpers';
import { useOrder } from './useOrder';

import type { UseOrderProps } from './useOrder';

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
const defaultProps: UseOrderProps<unknown> = {
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
      () => useOrder({ ...defaultProps, prefix: 'test' }),
      {
        wrapper: (ui) => wrapWithProviders(ui.children, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.order).toBe('desc');
    });
    await waitFor(() => {
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

    const { result } = renderHook(() => useOrder(defaultProps), {
      wrapper: (ui) => wrapWithProviders(ui.children, { queryClient }),
    });

    await waitFor(() => {
      expect(result.current.order).toBe('desc');
    });
    await waitFor(() => {
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

    const { result } = renderHook(() => useOrder(defaultProps), {
      wrapper: (ui) => wrapWithProviders(ui.children, { queryClient }),
    });

    await waitFor(() => {
      expect(result.current.order).toBe(
        defaultProps.initialRoute.defaultOrder.order
      );
    });
    await waitFor(() => {
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

    const { result } = renderHook(() => useOrder(defaultProps), {
      wrapper: (ui) => wrapWithProviders(ui.children, { queryClient }),
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
    });
    await waitFor(() => {
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
    });
    await waitFor(() => {
      expect(result.current.order).toBe('desc');
    });
    await waitFor(() => {
      expect(result.current.orderBy).toBe('size');
    });
  });
});
