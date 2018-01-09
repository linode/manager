import { createElement, Component, PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { parse } from 'querystring';
import isEqual from 'lodash/isEqual';

export default (WrappedComponent) => {
  class QueryParser extends PureComponent {
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

      return createElement(WrappedComponent, updatedProps);
    }
  }

  QueryParser.propTypes = {
    location: PropTypes.shape({
      query: PropTypes.object,
    }).isRequired,
  };

  return QueryParser;
};
