import { DateTime } from 'luxon';
import { equals, pathOr, sort, splitAt } from 'ramda';
import * as React from 'react';
import { Order } from 'src/components/Pagey';
import usePreferences from 'src/hooks/usePreferences';
import usePrevious from 'src/hooks/usePrevious';
import { UserPreferences } from 'src/store/preferences/preferences.actions';
import {
  sortByArrayLength,
  sortByNumber,
  sortByString,
  sortByUTFDate,
} from 'src/utilities/sort-by';
import { debounce } from 'throttle-debounce';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import { useHistory, useLocation } from 'react-router-dom';

export interface OrderByProps extends State {
  handleOrderChange: (orderBy: string, order: Order) => void;
  data: any[];
}

interface State {
  order: Order;
  orderBy: string;
}

interface Props {
  data: any[];
  children: (p: OrderByProps) => React.ReactNode;
  order?: Order;
  orderBy?: string;
  preferenceKey?: string; // If provided, will store/read values from user preferences
}

export type CombinedProps = Props;

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
  preferences: UserPreferences,
  params: Record<string, string>,
  defaultOrderBy: string,
  defaultOrder: Order
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
  if (['asc', 'desc'].includes(params.order) && params.orderBy) {
    return {
      order: params.order,
      orderBy: params.orderBy,
    };
  }
  return (
    preferences?.sortKeys?.[preferenceKey] ?? {
      orderBy: defaultOrderBy,
      order: defaultOrder,
    }
  );
};

export const sortData = (orderBy: string, order: Order) => {
  return sort((a, b) => {
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
        .map(eachValue =>
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
    const aValue = pathOr('', !!orderByProp ? orderByProp : [orderBy], a);
    const bValue = pathOr('', !!orderByProp ? orderByProp : [orderBy], b);

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

export const OrderBy: React.FC<CombinedProps> = props => {
  const { preferences, updatePreferences } = usePreferences();
  const location = useLocation();
  const history = useHistory();
  const params = getParamsFromUrl(location.search);

  const initialValues = getInitialValuesFromUserPreferences(
    props.preferenceKey ?? '',
    preferences ?? {},
    params,
    props.orderBy ?? 'label',
    props.order ?? 'desc'
  );

  const [orderBy, setOrderBy] = React.useState<string>(initialValues.orderBy);
  const [order, setOrder] = React.useState<Order>(initialValues.order as Order);

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
  const sortedData = sortData(orderBy, order)(dataToSort.current);

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
            ...(preferences?.sortKeys ?? {}),
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

  const downstreamProps = {
    ...props,
    order,
    orderBy,
    handleOrderChange,
    data: sortedData,
    count: props.data.length,
  };

  // eslint-disable-next-line
  return <>{props.children(downstreamProps)}</>;
};

export default React.memo(OrderBy);

const isValidDate = (date: any) => {
  return DateTime.fromISO(date).isValid;
};
