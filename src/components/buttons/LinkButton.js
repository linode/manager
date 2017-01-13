import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class LinkButton extends Component {
  constructor() {
    super();
  }

  render() {
    const { onClick, to, children } = this.props;

    if (to) {
      return (
        <Link
          className="btn btn-cancel"
          to={to}
        >{children}</Link>
      );
    }

    return (
      <button
        className="btn btn-cancel"
        onClick={onClick}
      >{children}</button>
    );
  }
}

LinkButton.propTypes = {
  onClick: PropTypes.func,
  to: PropTypes.string,
};
