import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function WarningButton(props) {
  return (
    <Link
      to={props.to}
      className="btn btn-warning"
      target={props.target ? props.target : ''}
    ><i className="fa fa-exclamation"></i></Link>
  );
}

WarningButton.propTypes = {
  to: PropTypes.string.isRequired,
  target: PropTypes.string,
};
