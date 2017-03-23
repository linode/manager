import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function CreateHelper({ label, href, linkText, onClick }) {
  return (
    <section className="BlankSlate">
      <div className="BlankSlate-body">
        You've got no {label}! Click&nbsp;
        <Link className="force-link" to={href} onClick={onClick}>{linkText}</Link>
        &nbsp;to get started.
      </div>
    </section>
  );
}

CreateHelper.propTypes = {
  label: PropTypes.string.isRequired,
  linkText: PropTypes.any.isRequired,
  href: PropTypes.string,
  onClick: PropTypes.func,
};
