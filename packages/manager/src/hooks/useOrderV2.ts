import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { sortData } from 'src/components/OrderBy';
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import type { LinkProps, RegisteredRouter } from '@tanstack/react-router';
import type { OrderSetWithPrefix } from 'src/types/ManagerPreferences';

export type Order = 'asc' | 'desc';

export interface UseOrderV2Props<T> {
  /**
   * data to sort
   * This is an optional prop to sort client side data,
   * when useOrderV2 isn't used to just provide a sort order for our queries.
   *
   * We usually would rather add to sorting as a param to the query,
   * but in some cases the endpoint won't allow it, or we can't get around inheriting the data from a parent component.
   */
  data?: T[];
  /**
   * initial order to use when no query params are present
   * Includes the from and search params
   */
  initialRoute: {
    defaultOrder: {
      order: Order;
      orderBy: string;
    };
    from: LinkProps['to'];
  };
  /**
   * preference key to save to user preferences
   */
  preferenceKey: string;
  /**
   * prefix for the query params in the url
   */
  prefix?: string;
}

/**
 * useOrder is a hook that allows you to handle ordering tables.
 * It takes into account the following items when determining initial order:
 *  1. Query Params (Ex. ?order=asc&orderBy=status)
 *  2. User Preference
 *  3. Initial Order
 *
 * When a user changes order using the handleOrderChange function, the query params are
 * updated and the user preferences are also updated.
 */
export const useOrderV2 = <T>({
  data,
  initialRoute,
  preferenceKey,
  prefix,
}: UseOrderV2Props<T>) => {
  const { data: orderPreferences } = usePreferences(
    (preferences) => preferences?.sortKeys
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();
  const searchParams = useSearch({ strict: false });
  const navigate = useNavigate();

  const getOrderValues = () => {
    // 1. URL params with prefix
    if (
      prefix &&
      `${prefix}-order` in searchParams &&
      `${prefix}-orderBy` in searchParams
    ) {
      const prefixedParams = searchParams as OrderSetWithPrefix<typeof prefix>;
      return {
        order: prefixedParams[`${prefix}-order`],
        orderBy: prefixedParams[`${prefix}-orderBy`],
      };
    }

    // 2. Regular URL params
    if ('order' in searchParams && 'orderBy' in searchParams) {
      return {
        order: searchParams.order as Order,
        orderBy: searchParams.orderBy as string,
      };
    }

    // 3. Stored preferences
    const prefKey = prefix ? `${prefix}-${preferenceKey}` : preferenceKey;
    if (preferenceKey && orderPreferences?.[prefKey]) {
      return orderPreferences[prefKey];
    }

    // 4. Default values
    return initialRoute.defaultOrder;
  };

  const { order, orderBy } = getOrderValues();

  const handleOrderChange = (newOrderBy: string, newOrder: Order) => {
    const urlData = prefix
      ? {
          [`${prefix}-order`]: newOrder,
          [`${prefix}-orderBy`]: newOrderBy,
        }
      : {
          order: newOrder,
          orderBy: newOrderBy,
        };

    navigate<RegisteredRouter, string, string>({
      search: (prev) => ({
        ...prev,
        ...searchParams,
        ...urlData,
      }),
      to: initialRoute.from,
    });

    const prefKey = prefix ? `${prefix}-${preferenceKey}` : preferenceKey;
    updatePreferences({
      sortKeys: {
        ...(orderPreferences ?? {}),
        [prefKey]: { order: newOrder, orderBy: newOrderBy },
      },
    });
  };

  const sortedData = React.useMemo(
    () => (data ? sortData<T>(orderBy, order)(data) : null),
    [data, orderBy, order]
  );

  return { handleOrderChange, order, orderBy, sortedData };
};
