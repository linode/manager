import React, { PropTypes } from 'react';

import Button from './Button';

export default function PrimaryButton(props) {
  return (
    <Button
      buttonClass="btn-primary"
      disabled={props.disabled}
      onClick={props.onClick}
      type={props.type}
    >{props.children}</Button>
  );
}

PrimaryButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.string,
};

PrimaryButton.defaultProps = {
  disabled: false,
  type: 'button',
};
