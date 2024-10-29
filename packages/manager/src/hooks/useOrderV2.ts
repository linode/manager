import { useNavigate, useParams } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { debounce } from 'throttle-debounce';

import { getInitialValuesFromUserPreferences } from 'src/components/OrderBy';
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import type { RoutePaths } from '@tanstack/react-router';
import type { MigrationRouteTree } from 'src/routes';
import type { OrderSet } from 'src/types/ManagerPreferences';

export type Order = 'asc' | 'desc';

interface UseOrderV2Props {
  /**
   * initial order to use when no query params are present
   * Includes the from and search params
   */
  initialRoute: {
    from: RoutePaths<MigrationRouteTree>;
    search?: OrderSet;
  };
  /**
   * preference key to save to user preferences
   */
  preferenceKey?: string;
  /**
   * prefix for the query params in the url
   */
  prefix?: string;
}

/**
 * useOrder is a hook that allows you to handle ordering tables. It takes into account
 * the following items when determining initial order
 *  1. Query Params (Ex. ?order=asc&orderBy=status)
 *  2. User Preference
 *  3. Initial Order passed as params
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
  const params = useParams({ from: initialRoute.from });
  const navigate = useNavigate();

  const initialOrder = getInitialValuesFromUserPreferences(
    preferenceKey || '',
    preferences || {},
    params,
    initialRoute?.search?.orderBy,
    initialRoute?.search?.order,
    prefix
  );

  const [orderBy, setOrderBy] = useState(initialOrder.orderBy);
  const [order, setOrder] = useState<'asc' | 'desc'>(initialOrder.order);

  const debouncedUpdateUserPreferences = useRef(
    debounce(1500, false, (orderBy: string, order: Order) => {
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

    navigate({
      search: (prev) => ({
        ...prev,
        ...params,
        ...urlData,
      }),
      to: initialRoute.from,
    });

    debouncedUpdateUserPreferences(newOrderBy, newOrder);
  };

  return { handleOrderChange, order, orderBy };
};
