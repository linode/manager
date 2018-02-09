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

      this.state = {
        currentPage: -1,
        fetchAllAttempted: false,
      };
    }

    componentWillMount = async () => {
      this.getFirstPage();
    }

    componentDidUpdate = async () => {
      const { apiData } = this.props;

      if (apiData.totalPages > 1 && !this.state.fetchAllAttempted) {
        this.setState({ fetchAllAttempted: true });

        const wait100 = () => new Promise(resolve => setTimeout(resolve, 100));

        // fetch in reverse in case the number of pages shrinks while fetching
        for (let i = apiData.totalPages - 1; i > 0; i--) {
          await wait100();
          this.props.dispatch(apiModule.page(i));
        }
      }
    }

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

    getNextPage = () => {
      if ((this.state.currentPage + 1) > this.state.lastPage) {
        return;
      }

      this.getPage(this.state.currentPage + 1);
    }

    getPreviousPage = () => {
      if ((this.state.currentPage - 1) < 0) {
        return;
      }

      this.getPage(this.state.currentPage - 1);
    }

    getFirstPage = () => {
      this.getPage(0);
    }

    getLastPage = () => {
      const { apiData } = this.props;
      this.getPage(apiData.totalPages - 1);
    }

    pageData = (page) => {
      const { apiData } = this.props;

      const begin = page * RESULTS_PER_PAGE;
      const end = begin + RESULTS_PER_PAGE;
      const pageIDs = apiData.ids.slice(begin, end);

      // TODO: get the plural name off the state path with split on '.' last index
      const pageData = pageIDs.map((id) => apiData[apiStatePath][id]);
      /**
       * NB: In the case that an item is deleted from the first page on the
       * left adjacent to a page that contains null values, one undefined value
       * will be "pused to the right" onto that page. So, we simply ignore it and
       * allow the page to shrink temporarily.
       */
      return compact(pageData);
    }

    pageControls = () => ({
      getFirstPage: this.getFirstPage,
      getPreviousPage: this.getPreviousPage,
      getNextPage: this.getNextPage,
      getLastPage: this.getLastPage,
    })

    render() {
      const pageData = this.pageData(this.state.currentPage);
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
