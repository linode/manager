import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class Button extends Component {
  constructor() {
    super();
  }

  render() {
    const { onClick, disabled, to, children, className } = this.props;

    const classes = `${className} btn btn-default`;

    if (to) {
      return (
        <Link
          className={classes}
          to={to}
          disabled={disabled}
        >{children}</Link>
      );
    }

    return (
      <button
        className={classes}
        onClick={onClick}
        disabled={disabled}
      >{children}</button>
    );
  }
}

Button.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};
