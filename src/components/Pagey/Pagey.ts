import { clone } from 'ramda';
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
  pages?: number;
  pageSize: number;
  data?: T[];
  orderBy?: string;
  order: 'asc' | 'desc';
  filter: any;
  searching: boolean;
}

export interface PaginationProps<T> extends State<T> {
  handlePageChange: (v: number, showSpinner?: boolean) => void;
  handlePageSizeChange: (v: number) => void;
  request: <U={}>(update?: (v: T[]) => U) => Promise<void>;
  handleOrderChange: (key: string, order?: 'asc' | 'desc') => void;
  handleSearch: (newFilter: any) => void;
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
      filter: {},
      searching: false,
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
      /**
       * we might potentially have a search term to filter by
       */
      const filters = clone(this.state.filter);

      if (this.state.orderBy) {
        filters['+order_by'] = this.state.orderBy;
        filters['+order'] = this.state.order;
      }
      return requestFn(this.props, { page: this.state.page, page_size: this.state.pageSize }, filters)
        .then((response) => {
          this.setState({
            count: response.results,
            page: response.page,
            pages: response.pages,
            data: map ? map(response.data) : response.data,
            loading: false,
            error: undefined,
          });
        })
        .catch((response) => {
          this.setState({ loading: false, error: response });
        });
    };

    public handlePageSizeChange = (pageSize: number) => {
      this.setState({ pageSize, page: 1 }, () => { this.request() });
    };

    public handlePageChange = (page: number, showSpinner?: boolean) => {
      /**
       * change the page, make the request, and set loading state if specified
       */
      if (showSpinner) { this.setState({ loading: true }) };
      this.setState({ page }, () => {
        this.request()
          .then(() => {
            if (this.state.loading) {
              this.setState({ loading: false })
            }
          })
      });
    };

    public handleOrderChange = (orderBy: string, order: 'asc' | 'desc' = 'asc') => {
      this.setState({ orderBy, order, page: 1 }, () => this.request());
    };

    public handleSearch = (filter: any) => {
      this.setState({ filter, page: 1, searching: true }, () => {
        return this.request()
          .then(() => this.setState({ searching: false }))
      });
    }

    public render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state,
        handlePageChange: this.handlePageChange,
        handlePageSizeChange: this.handlePageSizeChange,
        request: this.request,
        handleOrderChange: this.handleOrderChange,
        handleSearch: this.handleSearch,
        onDelete: this.onDelete,
      });
    }
  }
}
