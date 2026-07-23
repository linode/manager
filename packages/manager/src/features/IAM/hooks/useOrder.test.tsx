import { queryClientFactory } from '@linode/queries';
import { act, renderHook, waitFor } from '@testing-library/react';

import { wrapWithProviders } from '../utilities/testHelpers';
import { useOrder } from './useOrder';

import type { UseOrderProps } from './useOrder';

const mockNavigate = vi.fn();
const mockUseSearch = vi.fn(() => ({}));

const queryMocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  useMutatePreferences: vi.fn(),
  usePreferences: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
    useSearch: vi.fn(() => mockUseSearch()),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useMutatePreferences: queryMocks.useMutatePreferences,
    usePreferences: queryMocks.usePreferences,
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

    queryMocks.usePreferences.mockReturnValue({ data: undefined });
    queryMocks.mutateAsync.mockResolvedValue(undefined);
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: queryMocks.mutateAsync,
    });
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

    queryMocks.usePreferences.mockReturnValue({
      data: {
        volumes: {
          order: 'desc',
          orderBy: 'size',
        },
      },
    });

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

    queryMocks.usePreferences.mockReturnValue({ data: {} });

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
    mockUseSearch.mockReturnValue({});

    queryMocks.usePreferences.mockReturnValue({ data: {} });

    const { rerender, result } = renderHook(() => useOrder(defaultProps), {
      wrapper: (ui) => wrapWithProviders(ui.children, { queryClient }),
    });

    act(() => {
      result.current.handleOrderChange('size', 'desc');
    });

    mockUseSearch.mockReturnValue({
      order: 'desc',
      orderBy: 'size',
    });
    rerender();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
          to: '/',
        })
      );
    });
    await waitFor(() => {
      expect(queryMocks.mutateAsync).toHaveBeenCalledWith(
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
