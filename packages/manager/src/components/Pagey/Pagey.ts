import { ResourcePage } from 'linode-js-sdk/lib/types'
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

export type OrderBy = undefined | string;

interface State<T = {}> {
  count: number;
  error?: Linode.ApiFieldError[];
  loading: boolean;
  isSorting?: boolean;
  page: number;
  pages?: number;
  pageSize: number;
  data?: T[];
  orderBy?: OrderBy;
  order: Order;
  filter: any;
  searching: boolean;
}

export interface PaginationProps<T> extends State<T> {
  handlePageChange: (v: number, showSpinner?: boolean) => void;
  handlePageSizeChange: (v: number) => void;
  request: <U = {}>(update?: (v: T[]) => U) => Promise<void>;
  handleOrderChange: HandleOrderChange;
  handleSearch: (newFilter: any) => void;
  onDelete: () => void;
}

const asc: 'asc' = 'asc';

export default (requestFn: PaginatedRequest) => (
  Component: React.ComponentType<any>
) => {
  return class WrappedComponent extends React.PureComponent<any, State> {
    state: State = {
      count: 0,
      loading: true,
      isSorting: false,
      page: 1,
      pageSize: storage.pageSize.get() || 25,
      error: undefined,
      orderBy: undefined,
      order: asc,
      filter: {},
      searching: false
    };

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
      return requestFn(
        this.props,
        { page: this.state.page, page_size: this.state.pageSize },
        filters
      )
        .then(response => {
          this.setState({
            count: response.results,
            page: response.page,
            pages: response.pages,
            data: map ? map(response.data) : response.data,
            loading: false,
            error: undefined,
            isSorting: false,
            searching: false
          });
        })
        .catch(response => {
          this.setState({ loading: false, error: response });
        });
    };

    public handlePageSizeChange = (pageSize: number) => {
      this.setState({ pageSize, page: 1 }, () => {
        this.request();
      });
      storage.pageSize.set(pageSize);
    };

    public handlePageChange = (page: number) => {
      /**
       * change the page, make the request
       */
      this.setState({ page }, () => {
        this.request();
      });
    };

    public handleOrderChange = (
      orderBy: string,
      order: Order = 'asc',
      page: number = 1
    ) => {
      this.setState({ orderBy, order, page, isSorting: true }, () =>
        this.request()
      );
    };

    public handleSearch = (filter: any) => {
      this.setState({ filter, page: 1, searching: true }, () => this.request());
    };

    public render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state,
        handlePageChange: this.handlePageChange,
        handlePageSizeChange: this.handlePageSizeChange,
        request: this.request,
        handleOrderChange: this.handleOrderChange,
        handleSearch: this.handleSearch,
        onDelete: this.onDelete
      });
    }
  };
};
