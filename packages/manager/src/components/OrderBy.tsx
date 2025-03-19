import { useMutatePreferences, usePreferences } from '@linode/queries';
import {
  getQueryParamsFromQueryString,
  pathOr,
  sortByArrayLength,
  sortByNumber,
  sortByString,
  splitAt,
  usePrevious,
} from '@linode/utilities';
import { DateTime } from 'luxon';
import { equals, sort } from 'ramda';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { debounce } from 'throttle-debounce';

import { sortByUTFDate } from 'src/utilities/sortByUTFDate';

import type { ManagerPreferences, Order } from '@linode/utilities';

export interface OrderByProps<T> extends State {
  data: T[];
  handleOrderChange: (orderBy: string, order: Order) => void;
  order: Order;
  orderBy: string;
}

interface State {
  order: Order;
  orderBy: string;
}

interface Props<T> {
  children: (p: OrderByProps<T>) => React.ReactNode;
  data: T[];
  order?: Order;
  orderBy?: string;
  preferenceKey?: string; // If provided, will store/read values from user preferences
}

export type CombinedProps<T> = Props<T>;

/**
 * Given a set of UserPreferences (returned from the API),
 * and a preferenceKey, returns the order and orderby for
 * that preferenceKey if it exists. If the key isn't found,
 * or isn't provided, it will instead return
 * {
 *   order: defaultOrder,
 *   orderBy: defaultOrderBy
 * }
 * @param preferenceKey
 * @param preferences
 * @param defaultOrderBy
 * @param defaultOrder
 */
export const getInitialValuesFromUserPreferences = (
  preferenceKey: string,
  preferences: ManagerPreferences['sortKeys'],
  params: Record<string, string>,
  defaultOrderBy?: string,
  defaultOrder?: Order,
  prefix?: string
) => {
  /**
   * Priority order is:
   *
   * 1. query params (if provided)
   * 2. user preferences (if saved)
   * 3. anything passed as props
   * 4. default values
   *
   */
  if (
    prefix &&
    ['asc', 'desc'].includes(params[`${prefix}-order`]) &&
    params[`${prefix}-order`]
  ) {
    return {
      order: params[`${prefix}-order`],
      orderBy: params[`${prefix}-orderBy`],
    };
  }

  if (['asc', 'desc'].includes(params.order) && params.orderBy) {
    return {
      order: params.order,
      orderBy: params.orderBy,
    };
  }
  return (
    preferences?.[preferenceKey] ?? {
      order: defaultOrder,
      orderBy: defaultOrderBy,
    }
  );
};

export const sortData = <T,>(orderBy: string, order: Order) => {
  return sort<T>((a, b) => {
    /* If the column we're sorting on is an array (e.g. 'tags', which is string[]),
     *  we want to sort by the length of the array. Otherwise, do a simple comparison.
     */

    // Get target column for each object, and then sort based on data type

    /**
     * special case for sorting by ipv4
     * if the orderBy property contains an array index, include it in
     * the pathOr below. See "label="ipv4[0]" in SortableTableHead.tsx
     */
    let orderByProp;
    if (orderBy.includes('[')) {
      orderByProp = splitAt(orderBy.indexOf('['), orderBy) // will end up like ['ipv4', '[0]']
        .map((eachValue) =>
          eachValue.includes('[')
            ? /** if the element has square brackets, remove them and convert to a number */
              +eachValue.replace(/[\[\]']+/g, '')
            : eachValue
        );
    }

    /**
     * @todo document this in a README
     *
     * this allows us to pass a value such as 'maintenance:when' to the handleOrderChange
     * callback and it will turn it into a pathOr-friendly format
     *
     * so "maintenance:when" turns into ['maintenance', 'when']
     *
     * useful for when you want to sort by a nested property
     */
    if (orderBy.includes(':')) {
      orderByProp = orderBy.split(':');
    }

    /** basically, if orderByProp exists, do a pathOr with that instead */
    const aValue = pathOr<any, T>(
      '',
      !!orderByProp ? orderByProp : [orderBy],
      a
    );
    const bValue = pathOr<any, T>(
      '',
      !!orderByProp ? orderByProp : [orderBy],
      b
    );

    if (Array.isArray(aValue) && Array.isArray(bValue)) {
      return sortByArrayLength(aValue, bValue, order);
    }

    if (isValidDate(aValue) && isValidDate(bValue)) {
      return sortByUTFDate(aValue, bValue, order);
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortByString(aValue, bValue, order);
    }
    return sortByNumber(aValue, bValue, order);
  });
};

export const OrderBy = <T,>(props: CombinedProps<T>) => {
  const { data: sortPreferences } = usePreferences(
    (preferences) => preferences?.sortKeys
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();
  const location = useLocation();
  const history = useHistory();
  const params = getQueryParamsFromQueryString(location.search);

  const initialValues = getInitialValuesFromUserPreferences(
    props.preferenceKey ?? '',
    sortPreferences ?? {},
    params,
    props.orderBy,
    props.order
  );

  const [orderBy, setOrderBy] = React.useState<string>(
    initialValues.orderBy ?? 'label'
  );
  const [order, setOrder] = React.useState<Order>(
    (initialValues.order as Order) ?? 'desc'
  );

  // Stash a copy of the previous data for equality check.
  const prevData = usePrevious(props.data);

  // Our working copy of the data to be sorted.
  const dataToSort = React.useRef(props.data);

  // If `props.data` has changed, that's the data we should sort.
  //
  // Note: I really don't like this equality check that runs every render, but
  // I have yet to find a another solution.
  if (!equals(props.data, prevData)) {
    dataToSort.current = props.data;
  }

  // SORT THE DATA!
  const sortedData = sortData<T>(orderBy, order)(dataToSort.current);

  // Save this – this is what will be sorted next time around, if e.g. the order
  // or orderBy keys change. In that case we don't want to start from scratch
  // and sort `props.data`. That might result in odd UI behavior depending on
  // the data. See: https://github.com/linode/manager/pull/6855.
  dataToSort.current = sortedData;

  const debouncedUpdateUserPreferences = React.useRef(
    debounce(1500, false, (orderBy: string, order: Order) => {
      /**
       * If the preferenceKey is provided, we will store the passed
       * order props in user preferences. They will be read the next
       * time this component is loaded.
       */
      if (props.preferenceKey) {
        updatePreferences({
          sortKeys: {
            ...(sortPreferences ?? {}),
            [props.preferenceKey]: { order, orderBy },
          },
        });
      }
    })
  ).current;

  const handleOrderChange = (newOrderBy: string, newOrder: Order) => {
    setOrderBy(newOrderBy);
    setOrder(newOrder);

    // Update the URL query params so that the current sort is bookmark-able
    history.replace({ search: `?order=${newOrder}&orderBy=${newOrderBy}` });

    debouncedUpdateUserPreferences(newOrderBy, newOrder);
  };

  const downstreamProps: OrderByProps<T> = {
    ...props,
    data: sortedData,
    handleOrderChange,
    order,
    orderBy,
  };

  // eslint-disable-next-line
  return <>{props.children(downstreamProps)}</>;
};

const Memoized = React.memo(OrderBy);

export default <T,>(props: CombinedProps<T>) => <Memoized {...props} />;

const isValidDate = (date: any) => {
  return DateTime.fromISO(date).isValid;
};
