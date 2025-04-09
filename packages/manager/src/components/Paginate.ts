import { clamp } from '@linode/ui';
import { scrollTo } from '@linode/utilities';
import { slice } from 'ramda';
import * as React from 'react';

import { storage } from 'src/utilities/storage';

export const createDisplayPage =
  <T>(page: number, pageSize: number) =>
  (list: T[]): T[] => {
    const count = list.length;
    if (count === 0) {
      return list;
    }

    if (pageSize === Infinity) {
      return list;
    }

    const pages = Math.ceil(count / pageSize);
    const currentPage = clamp(1, pages, page);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, count - 1);

    return slice(startIndex, endIndex + 1, list);
  };

export interface PaginationProps<T> extends State {
  count: number;
  data: T[];
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
}

interface State {
  page: number;
  pageSize: number;
}

interface Props<T> {
  children: (p: PaginationProps<T>) => React.ReactNode;
  data: T[];
  page?: number;
  pageSize?: number;
  pageSizeSetter?: (v: number) => void;
  scrollToRef?: React.RefObject<any>;
  shouldScroll?: boolean;
  updatePageUrl?: (page: number) => void;
}

export default class Paginate<T> extends React.Component<Props<T>, State> {
  handlePageChange = (page: number) => {
    if (this.props.shouldScroll ?? true) {
      const { scrollToRef } = this.props;
      scrollTo(scrollToRef);
    }
    if (this.props.updatePageUrl) {
      this.props.updatePageUrl(page);
    }
    this.setState({ page });
  };

  handlePageSizeChange = (pageSize: number) => {
    this.setState({ pageSize });
    // Use the custom setter if one has been supplied.
    if (this.props.pageSizeSetter) {
      this.props.pageSizeSetter(pageSize);
    } else {
      storage.pageSize.set(pageSize);
    }
  };

  state: State = {
    page: this.props.page || 1,
    pageSize: this.props.pageSize || storage.pageSize.get() || 25,
  };

  render() {
    let view: (data: T[]) => T[];
    // update view based on page url
    if (this.props.updatePageUrl) {
      view = createDisplayPage(this.props.page || 1, this.state.pageSize);
    }
    // update view based on state
    else {
      view = createDisplayPage(this.state.page, this.state.pageSize);
    }

    const props = {
      ...this.props,
      ...this.state,
      count: this.props.data.length,
      data: view(this.props.data),
      handlePageChange: this.handlePageChange,
      handlePageSizeChange: this.handlePageSizeChange,
    };

    return this.props.children(props);
  }
}
