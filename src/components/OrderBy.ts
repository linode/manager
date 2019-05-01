import * as moment from 'moment';
import { pathOr, sort, splitAt } from 'ramda';
import * as React from 'react';
import { Order } from 'src/components/Pagey';
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
}

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
    /** basically, if orderByProp exists, do a pathOr with that instead */
    const aValue = pathOr(0, !!orderByProp ? orderByProp : [orderBy], a);
    const bValue = pathOr(0, !!orderByProp ? orderByProp : [orderBy], b);

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

export default class OrderBy extends React.Component<Props, State> {
  state: State = {
    order: this.props.order || 'asc',
    orderBy: this.props.orderBy || 'label'
  };

  handleOrderChange = (orderBy: string, order: Order) =>
    this.setState({ orderBy, order });

  render() {
    const sortedData = sortData(this.state.orderBy, this.state.order)(
      this.props.data
    );

    const props = {
      ...this.props,
      ...this.state,
      handleOrderChange: this.handleOrderChange,
      data: sortedData,
      count: this.props.data.length
    };

    return this.props.children(props);
  }
}

const isValidDate = (date: any) => {
  return moment(date, moment.ISO_8601, true).isValid();
};
