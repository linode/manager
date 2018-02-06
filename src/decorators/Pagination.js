import React, { Component } from 'react';
import invariant from 'invariant';

import Button from 'linode-components/dist/buttons/Button';

export const Pagination = (apiModule) => (Child) => {
  return class Paginator extends Component {
    constructor(props) {
      super(props);
      const { dispatch } = props;
      invariant(dispatch,
        '`dispatch` is required in Preload. Use connect() and ensure dispatch is available.');

      this.state = {
        pageData: null,
        currentPage: -1,
        lastPage: -1,
        fetchedPages: [],
      };
    }

    componentWillMount = async () => {
      this.getFirstPage();
    }

    getPage = async () => {
      const { dispatch } = this.props;
      const { currentPage } = this.state;

      const response = await dispatch(apiModule.page(currentPage));
      this.setState({
        // The API indexes pages starting at 1
        lastPage: response.pages - 1,
        pageData: response.data,
      });

      this.setFetchedPage(currentPage);
    }

    setFetchedPage = (page) => {
      const newFetchedPages = [...this.state.fetchedPages];
      newFetchedPages[page] = true;
      this.setState({ fetchedPages: newFetchedPages });
    }

    getNextPage = () => {
      if ((this.state.currentPage + 1) > this.state.lastPage) {
        return;
      }

      this.setState((state) => ({
        currentPage: state.currentPage + 1,
      }), this.getPage);
    }

    getPreviousPage = () => {
      if ((this.state.currentPage - 1) < 0) {
        return;
      }

      this.setState((state) => ({
        currentPage: state.currentPage - 1,
      }), this.getPage);
    }

    getFirstPage = () => {
      this.setState(() => ({
        currentPage: 0,
      }), this.getPage);
    }

    getLastPage = () => {
      this.setState(() => ({
        currentPage: this.state.lastPage,
      }), this.getPage);
    }

    renderControls = () => {
      return (
        <div>
          <Button onClick={this.getFirstPage}>
              First page
          </Button>
          <Button onClick={this.getPreviousPage}>
            Previous page
          </Button>
          <Button onClick={this.getNextPage}>
            Next page
          </Button>
          <Button onClick={this.getLastPage}>
            Last page
          </Button>
        </div>
      );
    }

    render() {
      const { pageData } = this.state;
      return (
        <div>
          {this.renderControls()}
          <Child page={pageData} {...this.props} />
          {this.renderControls()}
        </div>
      );
    }
  };
};
