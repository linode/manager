import { clamp, compose, prop, reverse, slice, sortBy, when } from 'ramda';
import * as React from 'react';
import { Order } from 'src/components/Pagey';

const orderList: <T>(order: Order, orderBy: keyof T) => (list: T[]) => T[] = (order, orderBy) => (list) => {
  return compose<any, any, any>(
    when(() => order === 'desc', reverse),
    sortBy(prop(orderBy as string)), /** I spent a long, long time trying to type this. */
  )(list);
};

const createDiplayPage = <T extends any>(page: number, pageSize: number) => (list: T[]): T[] => {
  const count = list.length;
  if (count === 0) { return list; }

  const pages = Math.ceil(count / pageSize);
  const currentPage = clamp(1, pages, page);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, count - 1);

  return slice(startIndex, endIndex + 1, list);
};

export interface PaginationProps extends State {
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleOrderChange: (orderBy: string, order: Order) => void;
  data: any[];
  count: number;
}

interface State {
  page: number;
  pageSize: number;
  order: Order;
  orderBy: string;
}

interface Props {
  data: any[];
  children: (p: PaginationProps) => React.ReactNode;
  page?: number;
  pageSize?: number;
  order?: Order;
  orderBy?: string;
}

export default class Paginate extends React.Component<Props, State> {
  state: State = {
    page: this.props.page || 1,
    pageSize: this.props.pageSize || 25,
    order: this.props.order || 'asc',
    orderBy: this.props.orderBy || 'label',
  };

  handlePageChange = (page: number) => this.setState({ page });

  handlePageSizeChange = (pageSize: number) => this.setState({ pageSize });

  handleOrderChange = (orderBy: string, order: Order) => this.setState({ orderBy, order });

  render() {
    const order = orderList(this.state.order, this.state.orderBy);
    const view = createDiplayPage(this.state.page, this.state.pageSize);

    const props = {
      ...this.props,
      ...this.state,
      handlePageChange: this.handlePageChange,
      handlePageSizeChange: this.handlePageSizeChange,
      handleOrderChange: this.handleOrderChange,
      data: view(order(this.props.data)),
      count: this.props.data.length,
    };

    return this.props.children(props);
  }
}
