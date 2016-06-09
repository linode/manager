import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function HelpButton(props) {
  return (
    <Link
      to={props.to}
      className="btn btn-help"
      target="_blank"
    >?</Link>
  );
}

HelpButton.propTypes = { to: PropTypes.string.isRequired };
