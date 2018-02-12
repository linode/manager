import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import { RESULTS_PER_PAGE } from '~/constants';

export const Pagination = (apiModule, apiStatePath) => (Child) => {
  class Paginator extends Component {
    constructor(props) {
      super(props);

      this.dataName = apiStatePath.split('.').slice(-1).pop();

      this.state = {
        /* 0-indexed page number */
        currentPage: -1,
        fetchAllAttempted: false,
      };
    }

    /**
     * Always try to load the first page, using the logic in getPage. Note
     * that if the data is already in Redux this will not result in an API
     * request.
     */
    componentWillMount = async () => {
      this.getFirstPage();
    }

    /**
     * Fetch all pages while the user is viewing their first page. Use a
     * flag in state to only attempt this once.
     */
    componentDidUpdate = async () => {
      const { apiData } = this.props;
      const { fetchAllAttempted } = this.state;

      if (apiData.totalPages > 1 && !fetchAllAttempted) {
        this.setState({ fetchAllAttempted: true });

        const wait100 = () => new Promise(resolve => setTimeout(resolve, 100));
        for (let i = 1; i < apiData.totalPages; i++) {
          await wait100();
          this.props.dispatch(apiModule.page(i));
        }
      }
    }

    /**
     * Fetch data for a page if needed, and set the currentPage afterward
     *
     * @param {number} nextPage - The page to be fetched, 0-indexed
     */
    getPage = async (nextPage) => {
      const { dispatch } = this.props;
      const pageData = this.pageData(nextPage);

      if (isEmpty(pageData) || pageData.some((el) => el === undefined)) {
        await dispatch(apiModule.page(nextPage));
        this.setState({ currentPage: nextPage });
        return;
      }
      this.setState({ currentPage: nextPage });
    }

    /**
     * Get the next page, if the page isn't past the last page
     */
    getNextPage = () => {
      const { currentPage } = this.state;
      const { apiData: { totalPages } } = this.props;
      // NB: currentPage is 0-indexed and totalPages is 1-indexed
      if ((currentPage + 2) > totalPages) {
        return;
      }

      this.getPage(currentPage + 1);
    }

    /**
     * Get the previous page, if the page isn't before the first page
     */
    getPreviousPage = () => {
      const { currentPage } = this.state;
      if ((currentPage - 1) < 0) {
        return;
      }

      this.getPage(currentPage - 1);
    }

    /**
     * Get the first page using the logic of getPage
     */
    getFirstPage = () => {
      this.getPage(0);
    }

    /**
     * Get the last page using the logic of getPage
     */
    getLastPage = () => {
      const { apiData } = this.props;
      this.getPage(apiData.totalPages - 1);
    }

    pageData = (page) => {
      const { apiData } = this.props;

      const begin = page * RESULTS_PER_PAGE;
      const end = begin + RESULTS_PER_PAGE;
      const pageIDs = apiData.pageIDsBy_id.slice(begin, end);

      const pageData = pageIDs.map((id) => apiData[this.dataName][id]);
      /**
       * NB: In the case that an item is deleted from the first page on the
       * left adjacent to a page that contains null values, one undefined value
       * will be "pushed to the right" onto that page. So, we simply ignore it and
       * allow the page to shrink temporarily.
       */
      return compact(pageData);
    }

    pageControls = () => {
      const { currentPage } = this.state;
      const { apiData: { totalPages } } = this.props;
      return {
        getPage: this.getPage,
        getFirstPage: this.getFirstPage,
        getPreviousPage: this.getPreviousPage,
        getNextPage: this.getNextPage,
        getLastPage: this.getLastPage,
        currentPage: currentPage,
        totalPages: totalPages,
      };
    }

    render() {
      const { currentPage } = this.state;
      const pageData = this.pageData(currentPage);
      return (
        <div>
          <Child
            page={pageData}
            pageControls={this.pageControls()}
            {...this.props}
          />
        </div>
      );
    }
  }

  function mapStateToProps(state) {
    return {
      apiData: get(state, `api.${apiStatePath}`),
    };
  }

  Paginator.propTypes = {
    dispatch: PropTypes.func,
    apiData: PropTypes.object,
  };

  return connect(mapStateToProps)(Paginator);
};
