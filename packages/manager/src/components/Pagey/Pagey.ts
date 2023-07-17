import { APIError, Filter, ResourcePage } from '@linode/api-v4/lib/types';
import { clone } from 'ramda';
import * as React from 'react';

import { storage } from 'src/utilities/storage';

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
  f?: FilterParams
) => Promise<ResourcePage<T>>;

export type HandleOrderChange = (key: string, order?: Order) => void;

export type Order = 'asc' | 'desc';

export type OrderBy = string | undefined;

interface State<T = {}> {
  count: number;
  data?: T[];
  error?: APIError[];
  filter: Filter;
  isSorting?: boolean;
  loading: boolean;
  order: Order;
  orderBy?: OrderBy;
  page: number;
  pageSize: number;
  pages?: number;
  searching: boolean;
}

interface Options {
  // props and the result of the request.
  cb?: (ownProps: any, response: ResourcePage<any>) => any;
  order?: Order;
  // Callback to be executed after successful request, with the component's own
  orderBy?: OrderBy;
}

export interface PaginationProps<T> extends State<T> {
  handleOrderChange: HandleOrderChange;
  handlePageChange: (v: number, showSpinner?: boolean) => void;
  handlePageSizeChange: (v: number) => void;
  handleSearch: (newFilter: Filter) => void;
  onDelete: () => void;
  request: <U = {}>(update?: (v: T[]) => U) => Promise<void>;
}

export default (requestFn: PaginatedRequest, options: Options = {}) => (
  Component: React.ComponentType<any>
) => {
  return class WrappedComponent extends React.PureComponent<any, State> {
    componentDidMount() {
      this.mounted = true;
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    public render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state,
        handleOrderChange: this.handleOrderChange,
        handlePageChange: this.handlePageChange,
        handlePageSizeChange: this.handlePageSizeChange,
        handleSearch: this.handleSearch,
        onDelete: this.onDelete,
        request: this.request,
      });
    }

    public handleOrderChange = (
      orderBy: string,
      order: Order = 'asc',
      page: number = 1
    ) => {
      this.setState({ isSorting: true, order, orderBy, page }, () =>
        this.request()
      );
    };

    public handlePageChange = (page: number) => {
      /**
       * change the page, make the request
       */
      this.setState({ page }, () => {
        this.request();
      });
    };

    public handlePageSizeChange = (pageSize: number) => {
      this.setState({ page: 1, pageSize }, () => {
        this.request();
      });
      storage.pageSize.set(pageSize);
    };

    public handleSearch = (filter: Filter) => {
      this.setState({ filter, page: 1, searching: true }, () => this.request());
    };

    mounted: boolean = false;

    private onDelete = () => {
      const { data, page } = this.state;

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

    // eslint-disable-next-line @typescript-eslint/ban-types
    private request = (map?: Function) => {
      /**
       * we might potentially have a search term to filter by
       */
      const filters = clone(this.state.filter);

      if (this.state.orderBy) {
        filters['+order_by'] = this.state.orderBy;
        filters['+order'] = this.state.order;
      }
      return requestFn(
        this.props,
        { page: this.state.page, page_size: this.state.pageSize },
        filters
      )
        .then((response) => {
          if (options.cb) {
            options.cb(this.props, response);
          }

          if (this.mounted) {
            this.setState({
              count: response.results,
              data: map ? map(response.data) : response.data,
              error: undefined,
              isSorting: false,
              loading: false,
              page: response.page,
              pages: response.pages,
              searching: false,
            });
          }
        })
        .catch((response) => {
          this.setState({ error: response, loading: false });
        });
    };

    state: State = {
      count: 0,
      error: undefined,
      filter: {},
      isSorting: false,
      loading: true,
      order: options.order ?? ('asc' as Order),
      orderBy: options.orderBy,
      page: 1,
      pageSize: storage.pageSize.get() || 25,
      searching: false,
    };
  };
};
