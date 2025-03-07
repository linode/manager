import { useMutatePreferences, usePreferences } from '@linode/queries';
import { getQueryParamsFromQueryString } from '@linode/utilities';
import { useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { debounce } from 'throttle-debounce';

import { getInitialValuesFromUserPreferences } from 'src/components/OrderBy';

import type { BaseQueryParams, Order, OrderSet } from '@linode/utilities';

export interface UseOrder extends OrderSet {
  handleOrderChange: (newOrderBy: string, newOrder: Order) => void;
}

/**
 * useOrder is a hook that allows you to handle ordering tables. It takes into account
 * the following items when determining initial order
 *  1. Query Params (Ex. ?order=asc&orderBy=status)
 *  2. User Preference
 *  3. Initial Order passed as params
 * When a user changes order using the handleOrderChange function, the query params are
 * updated and the user preferences are also updated.
 * @param initial {OrderSet} include the initial order
 * @param preferenceKey {string} include a preference key so user order preference is persisted
 * @param prefix {string} prefix in the url we can have many useOrders on the same page
 * @returns {order, orderBy, handleOrderChange}
 */
export const useOrder = (
  initial?: OrderSet,
  preferenceKey?: string,
  prefix?: string
): UseOrder => {
  const { data: sortPreferences } = usePreferences(
    (preferences) => preferences?.sortKeys
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();
  const location = useLocation();
  const history = useHistory();
  const params = getQueryParamsFromQueryString<BaseQueryParams>(
    location.search
  );

  const initialOrder = getInitialValuesFromUserPreferences(
    preferenceKey || '',
    sortPreferences || {},
    params,
    initial?.orderBy,
    initial?.order,
    prefix
  ) as OrderSet;

  const [orderBy, setOrderBy] = useState(initialOrder.orderBy);
  const [order, setOrder] = useState<'asc' | 'desc'>(initialOrder.order);

  const debouncedUpdateUserPreferences = useRef(
    debounce(1500, false, (orderBy: string, order: Order) => {
      if (preferenceKey) {
        updatePreferences({
          sortKeys: {
            ...(sortPreferences ?? {}),
            [preferenceKey]: { order, orderBy },
          },
        });
      }
    })
  ).current;

  const handleOrderChange = (newOrderBy: string, newOrder: Order) => {
    setOrderBy(newOrderBy);
    setOrder(newOrder);

    const urlData = prefix
      ? {
          [`${prefix}-order`]: newOrder,
          [`${prefix}-orderBy`]: newOrderBy,
        }
      : {
          order: newOrder,
          orderBy: newOrderBy,
        };

    const queryParams = new URLSearchParams(location.search);

    for (const [key, value] of Object.entries(urlData)) {
      queryParams.set(key, value);
    }

    history.replace(`?${queryParams.toString()}`);

    debouncedUpdateUserPreferences(newOrderBy, newOrder);
  };

  return { handleOrderChange, order, orderBy };
};
