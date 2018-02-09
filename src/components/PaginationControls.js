import React from 'react';
import PropTypes from 'prop-types';

import Button from 'linode-components/dist/buttons/Button';

export default function PageControls(props) {
  return (
    <div>
      <Button onClick={props.getFirstPage}>
        First page
      </Button>
      <Button onClick={props.getPreviousPage}>
        Previous page
      </Button>
      <Button onClick={props.getNextPage}>
        Next page
      </Button>
      <Button onClick={props.getLastPage}>
        Last page
      </Button>
    </div>
  );
}

PageControls.propTypes = {
  getFirstPage: PropTypes.func,
  getPreviousPage: PropTypes.func,
  getNextPage: PropTypes.func,
  getLastPage: PropTypes.func,
};
