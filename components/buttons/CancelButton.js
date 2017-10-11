import PropTypes from 'prop-types';
import React from 'react';

import Button from './Button';

export default function CancelButton(props) {
  return (
    <Button {...props} buttonClass="btn-link btn-cancel">
      {props.children}
    </Button>
  );
}

CancelButton.propTypes = {
  children: PropTypes.node,
};

CancelButton.defaultProps = {
  children: 'Cancel',
};
