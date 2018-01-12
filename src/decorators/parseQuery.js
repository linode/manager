import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { parse } from 'querystring';
import isEqual from 'lodash/isEqual';

export default (WrappedComponent) => {
  class QueryParser extends Component {
    shouldComponentUpdate(nextProps) {
      return !isEqual(this.props, nextProps);
    }

    WrappedComponent = Component;

    render() {
      const { location, ...rest } = this.props;
      const updatedProps = {
        ...rest,
        ...{
          location: {
            ...location,
            ...(location.search) ? { query: parse(location.search.substr(1)) } : { query: {} },
          },
        },
      };

      return React.createElement(WrappedComponent, updatedProps);
    }
  }

  QueryParser.propTypes = {
    location: PropTypes.shape({
      query: PropTypes.object,
    }).isRequired,
  };

  return QueryParser;
};
