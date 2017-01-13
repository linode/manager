import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { Button } from '~/components/buttons';

export default class LinkButton extends Component {
  constructor() {
    super();
  }

  render() {
    const { children, disabled, to, onClick, className } = this.props;

    return (
      <Button
        className={className}
        buttonClass="btn-link"
        onClick={onClick}
        to={to}
        disabled={disabled}
      >{children}</Button>
    );
  }
}

LinkButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  to: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

LinkButton.defaultProps = {
  disabled: false,
  className: '',
};
