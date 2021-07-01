import * as React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { OrderSet } from 'src/store/preferences/preferences.actions';
import { baseStore, wrapWithStore } from 'src/utilities/testHelpers';
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

// Store wrapper with custom preferences
const wrapWithCustomStore = ({ children }: { children: any }) => {
  return (
    <Provider
      store={baseStore({
        preferences: {
          data: {
            sortKeys: {
              'account-maintenance-order': {
                order: preferenceOrder.order,
                orderBy: preferenceOrder.orderBy,
              },
            },
          },
        },
      })}
    >
      {children}
    </Provider>
  );
};

const mockHistory = {
  push: jest.fn(),
  replace: jest.fn(),
};

// Used to mock query params
jest.mock('react-router-dom', () => ({
  useLocation: jest
    .fn()
    .mockReturnValueOnce({
      search: '',
    })
    .mockReturnValueOnce({
      search: `https://cloud.linode.com/account/maintenance?order=desc&orderBy=when`,
    })
    .mockReturnValue({
      search: '',
    }),
  useHistory: jest.fn(() => mockHistory),
}));

describe('useOrder hook', () => {
  it('should use default stort options when there are no query params or preference', () => {
    const { result } = renderHook(() => useOrder(defaultOrder), {
      wrapper: wrapWithStore,
    });

    expect(result.current.order).toBe(defaultOrder.order);
    expect(result.current.orderBy).toBe(defaultOrder.orderBy);
  });

  it('query paramaters with sort data should take precedence over defaults', () => {
    const { result } = renderHook(() => useOrder(defaultOrder), {
      wrapper: wrapWithStore,
    });

    expect(result.current.order).toBe(queryOrder.order);
    expect(result.current.orderBy).toBe(queryOrder.orderBy);
  });

  it('use preferences are used when there are no query params', () => {
    const { result } = renderHook(
      () => useOrder(defaultOrder, 'account-maintenance-order'),
      {
        wrapper: wrapWithCustomStore,
      }
    );

    expect(result.current.order).toBe(preferenceOrder.order);
    expect(result.current.orderBy).toBe(preferenceOrder.orderBy);
  });

  it('should change order when handleOrderChange is called with new values', () => {
    const { result } = renderHook(() => useOrder(defaultOrder), {
      wrapper: wrapWithStore,
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
      wrapper: wrapWithStore,
    });

    act(() =>
      result.current.handleOrderChange(
        handleOrderChangeOrder.orderBy,
        handleOrderChangeOrder.order
      )
    );

    expect(mockHistory.replace).toBeCalledWith({
      search: `?order=${handleOrderChangeOrder.order}&orderBy=${handleOrderChangeOrder.orderBy}`,
    });

    expect(result.current.order).toBe(handleOrderChangeOrder.order);
    expect(result.current.orderBy).toBe(handleOrderChangeOrder.orderBy);
  });
});
