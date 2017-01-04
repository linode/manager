import React, { PropTypes } from 'react';

export default function CancelButton(props) {
  return (
    <button
      type="button"
      className="btn btn-cancel"
      disabled={props.disabled}
      onClick={props.onClick}
    >{props.children}</button>
  );
}

CancelButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

CancelButton.defaultProps = {
  children: 'Cancel',
  disabled: false,
};
