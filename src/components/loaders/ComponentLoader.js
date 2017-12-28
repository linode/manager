import PropTypes from 'prop-types';

const ComponentLoader = ({ error }) => {
  if (error) {
    return window.handleError(error);
  }

  return null;
};

ComponentLoader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  pastDelay: PropTypes.bool.isRequired,
  error: PropTypes.object,
};

export default ComponentLoader;
