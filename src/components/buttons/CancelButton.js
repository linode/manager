import React, { PropTypes } from 'react';

import SecondaryButton from './SecondaryButton';

export default function CancelButton(props) {
  return (
    <SecondaryButton {...props} >
      {props.children}
    </SecondaryButton>
  );
}

CancelButton.propTypes = {
  children: PropTypes.node,
};

CancelButton.defaultProps = {
  children: 'Cancel',
};
