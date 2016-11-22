import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function CreateHelper({ label, href, linkText }) {
  return (
    <section className="CreateHelper">
      <div className="CreateHelper-body">
        You've got no {label}! Click&nbsp;
        <Link to={href}>{linkText}</Link>
        &nbsp;to get started.
      </div>
    </section>
  );
}

CreateHelper.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  linkText: PropTypes.any.isRequired,
};
