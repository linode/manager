import React, { PropTypes } from 'react';

import Button from './Button';

export default function PrimaryButton(props) {
  return (
    <div className="PrimaryButton">
      <Button {...props}>
        <i className="fa fa-plus" />
        {props.children}
      </Button>
    </div>
  );
}

PrimaryButton.propTypes = {
  buttonClass: PropTypes.string,
  children: PropTypes.node.isRequired,
};

PrimaryButton.defaultProps = {
  buttonClass: 'btn-primary',
};
