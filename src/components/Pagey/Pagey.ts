import * as React from 'react';

/**
 * @todo Document loading prop update as a result of promise resolution/rejection.
 * @todo How can we test the transition of loading from false -> true -> result?
 *
 * @todo Add basic sorting of one type and direction.
 * @todo Allow the request to be modified to allow additional filters (beyond sorting).
 * @todo Type FilterParams?
 */

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export type FilterParams = any;

export type PaginatedRequest<T = {}> = (
  ownProps?: any,
  p?: PaginationParams,
  f?: FilterParams,
) => Promise<Linode.ResourcePage<T>>;

interface State<T={}> {
  count: number;
  error?: Error;
  loading: boolean;
  page: number;
  pageSize: number;
  data?: T[];
  orderBy?: string;
  order: 'asc' | 'desc';
}

export interface PaginationProps<T> extends State<T> {
  handlePageChange: (v: number) => void;
  handlePageSizeChange: (v: number) => void;
  request: <U={}>(update?: (v: T[]) => U) => Promise<void>;
  handleOrderChange: (key: string, order?: 'asc' | 'desc') => void;
  onDelete: () => void;
}

const asc: 'asc' = 'asc';

export default (requestFn: PaginatedRequest) => (Component: React.ComponentType<any>) => {
  return class WrappedComponent extends React.PureComponent<any, State> {
    state: State = {
      count: 0,
      loading: true,
      page: 1,
      pageSize: 25,
      error: undefined,
      orderBy: undefined,
      order: asc,
    }

    private onDelete = () => {
      const { data, page } = this.state;
      if (data && data.length === 1) {
        return this.handlePageChange(page - 1);
      }

      return this.request();
    };

    private request = (map?: Function) => {
      const filters = {};

      if (this.state.orderBy) {
        filters['+order_by'] = this.state.orderBy;
        filters['+order'] = this.state.order;
      }
      return requestFn(this.props, { page: this.state.page, page_size: this.state.pageSize }, filters)
        .then((response) => {
          this.setState({
            count: response.results,
            page: response.page,
            data: map ? map(response.data) : response.data,
            loading: false,
          });
        })
        .catch((response) => {
          this.setState({ loading: false, error: response });
        });
    };

    public handlePageSizeChange = (pageSize: number) => {
      this.setState({ pageSize, page: 1 }, () => { this.request() });
    };

    public handlePageChange = (page: number) => {
      this.setState({ page }, () => { this.request() });
    };

    public handleOrderChange = (orderBy: string, order: 'asc' | 'desc' = 'asc') => {
      this.setState({ orderBy, order }, () => this.request());
    };

    public render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state,
        handlePageChange: this.handlePageChange,
        handlePageSizeChange: this.handlePageSizeChange,
        request: this.request,
        handleOrderChange: this.handleOrderChange,
        onDelete: this.onDelete,
      });
    }
  }
}
