import { compose, cond, length, path, prop, reverse, sortBy, when } from 'ramda';
import * as React from 'react';
import { Order } from 'src/components/Pagey';
import { isArray as _isArray } from 'util';

const isArray = (arr: any[], columnName: string) => {
  const targetColumn = path([columnName], arr[0]);
  return _isArray(targetColumn);
}

const orderList: <T>(order: Order, orderBy: keyof T) => (list: T[]) => T[] = (order, orderBy) => (list) => {
  console.log(orderBy);
  const orderedField = prop(orderBy as string);
  return compose<any, any, any>(
    when(() => order === 'desc', reverse),
    cond([
      [(a) => isArray(a, orderBy as string), sortBy(compose(length, orderedField))], // If the field to sort is an array (e.g. tags)
      [() => true, sortBy(orderedField), /** I spent a long, long time trying to type this. */]
    ]),
  )(list);
};

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

export default class OrderBy extends React.Component<Props, State> {
  state: State = {
    order: this.props.order || 'asc',
    orderBy: this.props.orderBy || 'label',
  };

  handleOrderChange = (orderBy: string, order: Order) => this.setState({ orderBy, order });

  render() {
    const order = orderList(this.state.order, this.state.orderBy);

    const props = {
      ...this.props,
      ...this.state,
      handleOrderChange: this.handleOrderChange,
      data: order(this.props.data),
      count: this.props.data.length,
    };

    return this.props.children(props);
  }
}
