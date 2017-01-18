import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function Button(props) {
  const {
    children,
    disabled,
    to,
    onClick,
    className,
    buttonClass,
    type,
  } = props;

  const classes = `btn ${buttonClass} ${className}`;

  return to ? (
    <Link
      className={classes}
      to={to}
      onClick={onClick}
      disabled={disabled}
    >{children}</Link>
  ) : (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >{children}</button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  to: PropTypes.string,
  className: PropTypes.string,
  buttonClass: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

Button.defaultProps = {
  disabled: false,
  buttonClass: 'btn-default',
  type: 'button',
  className: '',
};
