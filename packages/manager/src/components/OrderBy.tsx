import { DateTime } from 'luxon';
import { pathOr, sort, splitAt } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { debounce } from 'throttle-debounce';

import { Order } from 'src/components/Pagey';
import withPreferences, {
  Props as PreferencesProps
} from 'src/containers/preferences.container';
import {
  SortKey,
  UserPreferences
} from 'src/store/preferences/preferences.actions';
import { isArray } from 'util';

import {
  sortByArrayLength,
  sortByNumber,
  sortByString,
  sortByUTFDate
} from 'src/utilities/sort-by';

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
  preferenceKey?: SortKey; // If provided, will store/read values from user preferences
}

export type CombinedProps = Props & PreferencesProps;

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
  preferenceKey: SortKey | '',
  preferences: UserPreferences,
  defaultOrderBy: string,
  defaultOrder: Order
) => {
  return (
    preferences?.sortKeys?.[preferenceKey] ?? {
      orderBy: defaultOrderBy,
      order: defaultOrder
    }
  );
};

export const sortData = (orderBy: string, order: Order) =>
  sort((a, b) => {
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

    if (isArray(aValue) && isArray(bValue)) {
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

export const OrderBy: React.FC<CombinedProps> = props => {
  const [orderBy, setOrderBy] = React.useState<string>(
    props.orderBy ?? 'label'
  );
  const [order, setOrder] = React.useState<Order>(props.order ?? 'desc');

  const debouncedUpdateUserPreferences = React.useRef(
    debounce(1500, false, (orderBy: string, order: Order) => {
      /**
       * If the preferenceKey is provided, we will store the passed
       * order props in user preferences. They will be read the next
       * time this component is loaded.
       */
      const {
        getUserPreferences,
        preferenceKey,
        updateUserPreferences
      } = props;
      if (preferenceKey) {
        getUserPreferences()
          .then(preferences => {
            updateUserPreferences({
              ...preferences,
              sortKeys: {
                ...preferences.sortKeys,
                [preferenceKey]: { order, orderBy }
              }
            });
          })
          // It doesn't matter if this fails, the value simply won't be preserved.
          .catch(_ => null);
      }
    })
  ).current;

  const handleOrderChange = (newOrderBy: string, newOrder: Order) => {
    setOrderBy(newOrderBy);
    setOrder(newOrder);
    debouncedUpdateUserPreferences(newOrderBy, newOrder);
  };

  const sortedData = sortData(orderBy, order)(props.data);

  const downstreamProps = {
    ...props,
    order,
    orderBy,
    handleOrderChange,
    data: sortedData,
    count: props.data.length
  };

  // eslint-disable-next-line
  return <>{props.children(downstreamProps)}</>;
};

const enhanced = compose<CombinedProps, Props>(withPreferences());

export default enhanced(OrderBy);

const isValidDate = (date: any) => {
  return DateTime.fromISO(date).isValid;
};
