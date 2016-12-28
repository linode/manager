import React, { PropTypes } from 'react';

export default function CancelButton(props) {
  return (
    <button
      type="button"
      className="btn btn-cancel"
      disabled={props.disabled}
      onClick={props.onClick}
    >{props.text}</button>
  );
}

CancelButton.propTypes = {
  text: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

CancelButton.defaultProps = {
  text: 'Cancel',
  disabled: false,
};
