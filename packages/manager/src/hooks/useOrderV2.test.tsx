import { act, renderHook, waitFor } from '@testing-library/react';

import { HttpResponse, http, server } from 'src/mocks/testServer';
import { queryClientFactory } from 'src/queries/base';
import { usePreferences } from 'src/queries/profile/preferences';
import { wrapWithThemeAndRouter } from 'src/utilities/testHelpers';

import { useOrderV2 } from './useOrderV2';

import type { OrderSet } from 'src/types/ManagerPreferences';

// Default for Sorting
const defaultOrder: OrderSet = {
  order: 'asc',
  orderBy: 'status',
};

// Expected order for preference test
const queryOrder: OrderSet = {
  order: 'desc',
  orderBy: 'when',
};

// Expected order for preference test
const preferenceOrder: OrderSet = {
  order: 'asc',
  orderBy: 'type',
};

// Expected order for calling handleOrderChange
const handleOrderChangeOrder: OrderSet = {
  order: 'desc',
  orderBy: 'type',
};

const mockNavigate = vi.fn();

// Used to mock query params
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
    useParams: vi.fn(() => ({
      volumeId: '123',
    })),
  };
});

const queryClient = queryClientFactory();

const currentRoute = '/';

describe('useOrderV2 hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use default sort options when there are no query params or preference', async () => {
    const { result } = renderHook(
      () =>
        useOrderV2({
          initialRoute: {
            from: currentRoute,
            search: {
              order: defaultOrder.order,
              orderBy: defaultOrder.orderBy,
            },
          },
        }),
      {
        wrapper: (ui) =>
          wrapWithThemeAndRouter(ui.children, {
            queryClient,
          }),
      }
    );

    await waitFor(() => {
      expect(result.current.order).toBe(defaultOrder.order);
      expect(result.current.orderBy).toBe(defaultOrder.orderBy);
    });
  });

  it('query parameters with sort data should take precedence over defaults', async () => {
    const { result } = renderHook(
      () =>
        useOrderV2({
          initialRoute: {
            from: currentRoute,
            search: {
              order: queryOrder.order,
              orderBy: queryOrder.orderBy,
            },
          },
        }),
      {
        wrapper: (ui) =>
          wrapWithThemeAndRouter(ui.children, {
            queryClient,
          }),
      }
    );

    await waitFor(() => {
      expect(result.current.order).toBe(queryOrder.order);
      expect(result.current.orderBy).toBe(queryOrder.orderBy);
    });
  });

  it('use preferences are used when there are no query params', async () => {
    const queryClient = queryClientFactory();
    server.use(
      http.get('*/profile/preferences', () => {
        return HttpResponse.json({
          sortKeys: {
            'account-maintenance-order': preferenceOrder,
          },
        });
      })
    );

    const { result: preferencesResult } = renderHook(() => usePreferences(), {
      wrapper: (ui) => wrapWithThemeAndRouter(ui.children, { queryClient }),
    });

    // This is kind of a bug. useOrder currently requires preferences to be cached
    // before it works properly.
    await waitFor(() => {
      expect(preferencesResult.current.data).toBeDefined();
    });

    const { result } = renderHook(
      () =>
        useOrderV2({
          initialRoute: {
            from: currentRoute,
            search: undefined,
          },
          preferenceKey: 'account-maintenance-order',
        }),
      {
        wrapper: (ui) => wrapWithThemeAndRouter(ui.children, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.order).toBe(preferenceOrder.order);
      expect(result.current.orderBy).toBe(preferenceOrder.orderBy);
    });
  });

  it('should change order when handleOrderChange is called with new values', async () => {
    const { result } = renderHook(
      () =>
        useOrderV2({
          initialRoute: {
            from: currentRoute,
            search: undefined,
          },
        }),
      {
        wrapper: (ui) => wrapWithThemeAndRouter(ui.children, { queryClient }),
      }
    );

    act(() =>
      result.current.handleOrderChange(
        handleOrderChangeOrder.orderBy,
        handleOrderChangeOrder.order
      )
    );

    await waitFor(() => {
      expect(result.current.order).toBe(handleOrderChangeOrder.order);
      expect(result.current.orderBy).toBe(handleOrderChangeOrder.orderBy);
    });
  });

  it('should update query params when handleOrderChange is called', async () => {
    const { result } = renderHook(
      () =>
        useOrderV2({
          initialRoute: {
            from: currentRoute,
            search: undefined,
          },
          preferenceKey: 'account-maintenance-order',
        }),
      {
        wrapper: (ui) => wrapWithThemeAndRouter(ui.children, { queryClient }),
      }
    );

    act(() =>
      result.current.handleOrderChange(
        handleOrderChangeOrder.orderBy,
        handleOrderChangeOrder.order
      )
    );

    expect(mockNavigate).toHaveBeenCalled();

    // Get the actual function that was passed for futu
    const searchFn = mockNavigate.mock.calls[0][0].search;

    // Test that the search function returns the expected object
    expect(searchFn({})).toEqual({
      order: handleOrderChangeOrder.order,
      orderBy: handleOrderChangeOrder.orderBy,
      volumeId: '123',
    });

    await waitFor(() => {
      expect(mockNavigate.mock.calls[0][0].to).toBe(currentRoute);
      expect(result.current.order).toBe(handleOrderChangeOrder.order);
      expect(result.current.orderBy).toBe(handleOrderChangeOrder.orderBy);
    });
  });

  it('should update query params when handleOrderChange is called (with prefix)', async () => {
    const prefix = 'volume';
    const { result } = renderHook(
      () =>
        useOrderV2({
          initialRoute: {
            from: currentRoute,
            search: undefined,
          },
          prefix,
        }),
      {
        wrapper: (ui) => wrapWithThemeAndRouter(ui.children, { queryClient }),
      }
    );

    act(() =>
      result.current.handleOrderChange(
        handleOrderChangeOrder.orderBy,
        handleOrderChangeOrder.order
      )
    );

    expect(mockNavigate).toHaveBeenCalled();

    const searchFn = mockNavigate.mock.calls[0][0].search;

    await waitFor(() => {
      expect(searchFn({})).toEqual({
        [`${prefix}-order`]: handleOrderChangeOrder.order,
        [`${prefix}-orderBy`]: handleOrderChangeOrder.orderBy,
        volumeId: '123',
      });
      expect(result.current.order).toBe(handleOrderChangeOrder.order);
      expect(result.current.orderBy).toBe(handleOrderChangeOrder.orderBy);
    });
  });
});
