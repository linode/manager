import React, { PropTypes } from 'react';

import { Button } from '~/components/buttons';

export default function SubmitButton(props) {
  return (
    <Button
      type="submit"
      className={`btn ${props.className}`}
      disabled={props.disabled}
      onClick={props.onClick}
    >{props.children}</Button>
  );
}

SubmitButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

SubmitButton.defaultProps = {
  children: 'Save',
  className: 'btn-default',
  disabled: false,
};
