import * as moment from 'moment';
import { pathOr, sort } from 'ramda';
import * as React from 'react';
import { Order } from 'src/components/Pagey';
import { isArray } from 'util';

import { sortByArrayLength, sortByNumber, sortByString, sortByUTFDate }
  from 'src/utilities/sort-by';


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
    const aValue = pathOr(0, [orderBy], a);
    const bValue = pathOr(0, [orderBy], b);

    if (isArray(aValue) && isArray(bValue)) {
      console.log('by array length')
      return sortByArrayLength(aValue, bValue, order)
    }

    if (isValidDate(aValue) && isValidDate(bValue)) {
      console.log('by date');
      return sortByUTFDate(aValue, bValue, order)
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      console.log('by string');
      return sortByString(aValue, bValue, order)
    }
    console.log('by number')
    return sortByNumber(aValue, bValue, order)
  })

export default class OrderBy extends React.Component<Props, State> {
  state: State = {
    order: this.props.order || 'asc',
    orderBy: this.props.orderBy || 'label',
  };

  handleOrderChange = (orderBy: string, order: Order) => this.setState({ orderBy, order });

  render() {
    const sortedData = sortData(this.state.orderBy, this.state.order)(this.props.data);

    const props = {
      ...this.props,
      ...this.state,
      handleOrderChange: this.handleOrderChange,
      data: sortedData,
      count: this.props.data.length,
    };

    return this.props.children(props);
  }
}

const isValidDate = (date: any) => {
  return moment(date, moment.ISO_8601, true).isValid();
}
