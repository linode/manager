import { clamp, slice } from 'ramda';
import * as React from 'react';
import scrollTo from 'src/utilities/scrollTo';
import { storage } from 'src/utilities/storage';

export const createDisplayPage = <T extends any>(
  page: number,
  pageSize: number
) => (list: T[]): T[] => {
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

export interface PaginationProps extends State {
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  data: any[];
  count: number;
}

interface State {
  page: number;
  pageSize: number;
}

interface Props {
  data: any[];
  children: (p: PaginationProps) => React.ReactNode;
  page?: number;
  pageSize?: number;
  scrollToRef?: React.RefObject<any>;
  pageSizeSetter?: (v: number) => void;
  shouldScroll?: boolean;
  updatePageUrl?: (page: number) => void;
}

export default class Paginate extends React.Component<Props, State> {
  state: State = {
    page: this.props.page || 1,
    pageSize: this.props.pageSize || storage.pageSize.get() || 25,
  };

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

  render() {
    let view;
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
      handlePageChange: this.handlePageChange,
      handlePageSizeChange: this.handlePageSizeChange,
      data: view(this.props.data),
      count: this.props.data.length,
    };

    return this.props.children(props);
  }
}
