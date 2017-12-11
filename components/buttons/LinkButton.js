import PropTypes from 'prop-types';
import React from 'react';

import Button from './Button';

export default function LinkButton(props) {
  const { children, disabled, to, onClick, className, id } = props;

  return (
    <Button
      className={className}
      buttonClass="btn-link"
      onClick={onClick}
      to={to}
      id={id}
      disabled={disabled}
    >{children}</Button>
  );
}

LinkButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  to: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string,
};
