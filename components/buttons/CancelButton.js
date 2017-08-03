import React, { PropTypes } from 'react';

import Button from './Button';

export default function CancelButton(props) {
  return (
    <Button {...props} >
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
