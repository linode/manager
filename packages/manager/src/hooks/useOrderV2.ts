import { useNavigate, useSearch } from '@tanstack/react-router';

import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import type { RoutePaths } from '@tanstack/react-router';
import type { MigrationRouteTree } from 'src/routes';
import type { OrderSetWithPrefix } from 'src/types/ManagerPreferences';

export type Order = 'asc' | 'desc';

export interface UseOrderV2Props {
  /**
   * initial order to use when no query params are present
   * Includes the from and search params
   */
  initialRoute: {
    defaultOrder: {
      order: Order;
      orderBy: string;
    };
    from: RoutePaths<MigrationRouteTree>;
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
export const useOrderV2 = ({
  initialRoute,
  preferenceKey,
  prefix,
}: UseOrderV2Props) => {
  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();
  const searchParams = useSearch({ from: initialRoute.from });
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
    if (preferenceKey && preferences?.sortKeys?.[prefKey]) {
      return preferences.sortKeys[prefKey];
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

    navigate({
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
        ...(preferences?.sortKeys ?? {}),
        [prefKey]: { order: newOrder, orderBy: newOrderBy },
      },
    });
  };

  return { handleOrderChange, order, orderBy };
};
