import PropTypes from 'prop-types';
import React from 'react';


export default function ExternalLink(props) {
  const { children, disabled, to, className, id } = props;

  return (
    <a
      target="_blank"
      rel="nofollow noopener noreferrer"
      className={className}
      href={to}
      id={id}
      disabled={disabled}
    >
      {children}
      <i className="fa fa-external-link" />
    </a>
  );
}

ExternalLink.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
};
