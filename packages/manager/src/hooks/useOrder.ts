import * as qs from 'qs';
import { useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { getInitialValuesFromUserPreferences } from 'src/components/OrderBy';
import { usePreferences } from 'src/hooks/usePreferences';
import { OrderSet } from 'src/store/preferences/preferences.actions';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import { debounce } from 'throttle-debounce';

/**
 * useOrder is a hook that allows you to handle ordering tables. It takes into account
 * the following items when determining inital order
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
  initial: OrderSet,
  preferenceKey?: string,
  prefix?: string
) => {
  const { preferences, updatePreferences } = usePreferences();
  const location = useLocation();
  const history = useHistory();
  const params = getParamsFromUrl(location.search);

  const initialOrder = getInitialValuesFromUserPreferences(
    preferenceKey || '',
    preferences || {},
    params as Record<string, string>,
    initial.orderBy,
    initial.order,
    prefix
  ) as OrderSet;

  const [orderBy, setOrderBy] = useState(initialOrder.orderBy);
  const [order, setOrder] = useState<'asc' | 'desc'>(initialOrder.order);

  const debouncedUpdateUserPreferences = useRef(
    debounce(1500, false, (orderBy: string, order: 'asc' | 'desc') => {
      if (preferenceKey) {
        updatePreferences({
          sortKeys: {
            ...(preferences?.sortKeys ?? {}),
            [preferenceKey]: { order, orderBy },
          },
        });
      }
    })
  ).current;

  const handleOrderChange = (newOrderBy: string, newOrder: 'asc' | 'desc') => {
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

    const queryParams = qs.parse(location.search.replace('?', ''));

    const newQueries = { ...queryParams, ...urlData };

    history.replace(`?${qs.stringify(newQueries)}`);

    debouncedUpdateUserPreferences(newOrderBy, newOrder);
  };

  return { order, orderBy, handleOrderChange };
};
