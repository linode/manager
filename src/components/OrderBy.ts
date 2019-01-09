import { curry, pathOr, sort,  } from 'ramda';
import * as React from 'react';
import { Order } from 'src/components/Pagey';
import { isArray } from 'util';


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

export const sortData = curry((orderBy: string, order: Order, obj1: any, obj2: any) => {
  /* If the column we're sorting on is an array (e.g. 'tags', which is string[]),
  *  we want to sort by the length of the array. Otherwise, do a simple comparison.
  */

  // Get target column for each object, and length if this is an array
  let a = pathOr(0, [orderBy], obj1);
  let b = pathOr(0, [orderBy], obj2);
  if (isArray(a) && isArray(b)) {
    a = a.length;
    b = b.length;
  }

  // Sort
  let result: number;
  if (a > b) { result = 1; }
  else if (a < b) { result = -1; }
  else { result = 0; }

  // Ascending or descending
  // nb: thought this would be more efficient than sorting then conditionally reversing as a separate step
  return order === 'asc' ? result : -result;
});

export default class OrderBy extends React.Component<Props, State> {
  state: State = {
    order: this.props.order || 'asc',
    orderBy: this.props.orderBy || 'label',
  };

  handleOrderChange = (orderBy: string, order: Order) => this.setState({ orderBy, order });

  render() {
    const order = sortData(this.state.orderBy, this.state.order);
    const sortedData = sort(order, this.props.data);

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
