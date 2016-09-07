import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function HelpButton(props) {
  return (
    <Link
      to={props.to}
      className={`btn btn-help ${props.className}`}
      target="_blank"
    ><i className="fa fa-question"></i></Link>
  );
}

HelpButton.propTypes = {
  to: PropTypes.string.isRequired,
  className: PropTypes.string,
};
