import React from 'react';
import PropTypes from 'prop-types';

const PageLoader = ({ isLoading, pastDelay, error }) => {
  if (error) {
    return window.handleError(error);
  }

  if (isLoading && pastDelay) {
    return (
      <div className="AppLoader">
        <div className="AppLoader-text font-medium">Loading the Manager...</div>
        <div className="AppLoader-loader"></div>
      </div>
    );
  }

  return null;
};

PageLoader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  pastDelay: PropTypes.bool.isRequired,
  error: PropTypes.object,
};

export default PageLoader;
