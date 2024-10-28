import { useNavigate, useParams } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { debounce } from 'throttle-debounce';

import { getInitialValuesFromUserPreferences } from 'src/components/OrderBy';
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import type { ToSubOptions } from '@tanstack/react-router';
import type { OrderSet } from 'src/types/ManagerPreferences';

export type Order = 'asc' | 'desc';

interface UseOrderV2Props {
  /**
   * current route
   */
  currentRoute: ToSubOptions['to'];
  /**
   * initial order to start with
   */
  initial?: OrderSet;
  /**
   * preference key to save to user preferences
   */
  preferenceKey?: string;
  /**
   * prefix for the query params in the url
   */
  prefix?: string;
}

export const useOrderV2 = ({
  currentRoute,
  initial,
  preferenceKey,
  prefix,
}: UseOrderV2Props) => {
  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();
  const params = useParams({ strict: false });
  const navigate = useNavigate();

  const initialOrder = getInitialValuesFromUserPreferences(
    preferenceKey || '',
    preferences || {},
    params,
    initial?.orderBy,
    initial?.order,
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
      to: currentRoute,
    });

    debouncedUpdateUserPreferences(newOrderBy, newOrder);
  };

  return { handleOrderChange, order, orderBy };
};
