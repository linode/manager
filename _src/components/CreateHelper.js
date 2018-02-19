import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

export default function CreateHelper({ label, href, linkText, onClick }) {
  return (
    <div className="BlankSlate">
      <div className="BlankSlate-body">
        You have no {label}! Click&nbsp;
        {
          href
            ? <Link to={href} className="force-link" onClick={onClick}>{linkText}</Link>
            : <a className="force-link" onClick={onClick}>{linkText}</a>
        }
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
