import { compose, prop, reverse, sortBy, when } from 'ramda';
import * as React from 'react';
import { Order } from 'src/components/Pagey';

const orderList: <T>(order: Order, orderBy: keyof T) => (list: T[]) => T[] = (order, orderBy) => (list) => {
  return compose<any, any, any>(
    when(() => order === 'desc', reverse),
    sortBy(prop(orderBy as string)), /** I spent a long, long time trying to type this. */
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
