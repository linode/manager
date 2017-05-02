import React, { PropTypes } from 'react';

import { Button } from 'linode-components/buttons';

export default function SubmitButton(props) {
  return (
    <Button
      type="submit"
      className={`btn ${props.className}`}
      disabled={props.disabled}
      onClick={props.onClick}
    >{props.disabled ? props.disabledChildren : props.children}</Button>
  );
}

SubmitButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  disabledChildren: PropTypes.string,
  onClick: PropTypes.func,
};

SubmitButton.defaultProps = {
  children: 'Save',
  disabledChildren: 'Saving',
  className: 'btn-default',
  disabled: false,
};
