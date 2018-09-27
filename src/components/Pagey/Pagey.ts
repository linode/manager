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

interface CancellableRequest {
  cancel: (() => void) | null;
  request: () => Promise<Linode.ResourcePage<{}>>;
}

type RequestPayload = (
  ownProps?: any,
  p?: PaginationParams,
  f?: FilterParams
) => CancellableRequest;

interface State<T={}> {
  count: number;
  error?: Error;
  loading: boolean;
  page: number;
  pages?: number;
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

export default (requestFn: RequestPayload) => (Component: React.ComponentType<any>) => {
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
    
    cancelRequest: Function | null;

    componentWillUnmount() {
      if (typeof this.cancelRequest === 'function') {
        this.cancelRequest();
      }
    }

    private onDelete = () => {
      const { page, data } = this.state;
      /*
       * Basically, if we're on page 2 and the user deletes the last entity
       * on the page, send the user back to the previous page, AKA the max number
       * of pages.
       * 
       * This solves the issue where the user deletes the last entity
       * on a page and then sees an empty state instead of going to the
       * last page available
       * 
       * Please note that if the deletion of an entity is instant and not
       * initiated by the completetion of an event, we need to check that
       * the data.length === 1 because we're not calling this.request() to update
       * page and pages states
       */
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

      const { request, cancel } =
        requestFn(this.props, { page: this.state.page, page_size: this.state.pageSize }, filters);

      this.cancelRequest = cancel;

      request()
        .then((response) => {
          this.setState({
            count: response.results,
            page: response.page,
            pages: response.pages,
            data: map ? map(response.data) : response.data,
            loading: false,
          });
        })
        .catch((response) => {
          /* isCancelled is added to the rejection data in the inteceptor in request.ts */
          if (response.isCancelled) {
            return;
          }
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
