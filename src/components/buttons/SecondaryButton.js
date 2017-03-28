import React, { PropTypes } from 'react';

import Button from './Button';

export default function SecondaryButton(props) {
  return (
    <Button {...props} >
      {props.children}
    </Button>
  );
}

SecondaryButton.propTypes = {
  buttonClass: PropTypes.string,
  children: PropTypes.node,
};

SecondaryButton.defaultProps = {
  buttonClass: 'btn-secondary',
};
