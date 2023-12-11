import { act, renderHook } from '@testing-library/react-hooks';

import { rest, server } from 'src/mocks/testServer';
import { queryClientFactory } from 'src/queries/base';
import { usePreferences } from 'src/queries/preferences';
import { OrderSet } from 'src/types/ManagerPreferences';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useOrder } from './useOrder';

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

const mockHistory = {
  push: vi.fn(),
  replace: vi.fn(),
};

// Used to mock query params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useHistory: vi.fn(() => mockHistory),
  };
});

const queryClient = queryClientFactory();

describe('useOrder hook', () => {
  // wait for preferences to load
  beforeEach(async () => {
    await act(async () => {
      server.use(
        rest.get('*/profile/preferences', (_, res, ctx) => {
          return res(
            ctx.json({
              sortKeys: {
                'account-maintenance-order': preferenceOrder,
              },
            })
          );
        })
      );

      await renderHook(() => usePreferences(), {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }).waitForNextUpdate();
    });
  });

  it('should use default sort options when there are no query params or preference', () => {
    const { result } = renderHook(() => useOrder(defaultOrder), {
      wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
    });

    expect(result.current.order).toBe(defaultOrder.order);
    expect(result.current.orderBy).toBe(defaultOrder.orderBy);
  });

  it('query parameters with sort data should take precedence over defaults', () => {
    const { result } = renderHook(() => useOrder(defaultOrder), {
      wrapper: (ui) =>
        wrapWithTheme(ui, {
          MemoryRouter: {
            initialEntries: [
              'https://cloud.linode.com/account/maintenance?order=desc&orderBy=when',
            ],
          },
          queryClient,
        }),
    });

    expect(result.current.order).toBe(queryOrder.order);
    expect(result.current.orderBy).toBe(queryOrder.orderBy);
  });

  it('use preferences are used when there are no query params', async () => {
    const { result, waitFor } = renderHook(
      () => useOrder(defaultOrder, 'account-maintenance-order'),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    await waitFor(() => {
      expect(result.current.order).toBe(preferenceOrder.order);
      expect(result.current.orderBy).toBe(preferenceOrder.orderBy);
    });
  });

  it('should change order when handleOrderChange is called with new values', () => {
    const { result } = renderHook(() => useOrder(defaultOrder), {
      wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
    });

    act(() =>
      result.current.handleOrderChange(
        handleOrderChangeOrder.orderBy,
        handleOrderChangeOrder.order
      )
    );

    expect(result.current.order).toBe(handleOrderChangeOrder.order);
    expect(result.current.orderBy).toBe(handleOrderChangeOrder.orderBy);
  });

  it('should update query params when handleOrderChange is called', () => {
    const { result } = renderHook(() => useOrder(defaultOrder), {
      wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
    });

    act(() =>
      result.current.handleOrderChange(
        handleOrderChangeOrder.orderBy,
        handleOrderChangeOrder.order
      )
    );

    expect(mockHistory.replace).toBeCalledWith(
      `?order=${handleOrderChangeOrder.order}&orderBy=${handleOrderChangeOrder.orderBy}`
    );

    expect(result.current.order).toBe(handleOrderChangeOrder.order);
    expect(result.current.orderBy).toBe(handleOrderChangeOrder.orderBy);
  });

  it('should update query params when handleOrderChange is called (with prefix)', () => {
    const prefix = 'volume';
    const { result } = renderHook(
      () => useOrder(defaultOrder, undefined, prefix),
      {
        wrapper: (ui) => wrapWithTheme(ui, { queryClient }),
      }
    );

    act(() =>
      result.current.handleOrderChange(
        handleOrderChangeOrder.orderBy,
        handleOrderChangeOrder.order
      )
    );

    expect(mockHistory.replace).toBeCalledWith(
      `?${prefix}-order=${handleOrderChangeOrder.order}&${prefix}-orderBy=${handleOrderChangeOrder.orderBy}`
    );

    expect(result.current.order).toBe(handleOrderChangeOrder.order);
    expect(result.current.orderBy).toBe(handleOrderChangeOrder.orderBy);
  });
});
