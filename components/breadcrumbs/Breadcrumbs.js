import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function Breadcrumbs(props) {
  const { crumbs } = props;

  return (
    <div className="Breadcrumbs">
      <ul className="list-unstyled">
        {crumbs.map(({ to, label }) => <li key={label}><Link to={to}>{label}</Link></li>)}
      </ul>
    </div>
  )
}
