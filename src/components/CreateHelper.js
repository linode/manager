import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function CreateHelper({ label, href, linkText, onClick }) {
  return (
    <div className="BlankSlate">
      <div className="BlankSlate-body">
        You have no {label}! Click&nbsp;
        <Link className="force-link" to={href} onClick={onClick}>{linkText}</Link>
        &nbsp;to get started.
      </div>
    </div>
  );
}

CreateHelper.propTypes = {
  label: PropTypes.string.isRequired,
  linkText: PropTypes.any.isRequired,
  href: PropTypes.string,
  onClick: PropTypes.func,
};
